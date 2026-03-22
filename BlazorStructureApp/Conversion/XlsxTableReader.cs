using System.Globalization;
using ClosedXML.Excel;

namespace BlazorStructureApp.Conversion;

public static class XlsxTableReader
{
    public static IReadOnlyList<TableRow> ReadFirstSheet(Stream xlsxStream)
    {
        if (xlsxStream is null) throw new ArgumentNullException(nameof(xlsxStream));

        using var workbook = new XLWorkbook(xlsxStream);
        var worksheet = workbook.Worksheets.First();
        var range = worksheet.RangeUsed();
        if (range is null) return Array.Empty<TableRow>();

        var firstRow = range.FirstRowUsed();
        var headerMap = BuildHeaderMap(firstRow);

        var rows = new List<TableRow>();
        var orderIndex = 0;

        foreach (var row in range.RowsUsed().Skip(1))
        {
            var id = GetCellString(row, headerMap, "id");
            var levelText = GetCellString(row, headerMap, "level");
            var name = GetCellString(row, headerMap, "name");
            var comment = GetCellString(row, headerMap, "comment");
            var isBoldText = GetCellString(row, headerMap, "isbold");
            var parent = GetCellString(row, headerMap, "parent");

            if (string.IsNullOrWhiteSpace(id) && string.IsNullOrWhiteSpace(levelText) && string.IsNullOrWhiteSpace(name))
                continue;

            if (!int.TryParse(levelText, NumberStyles.Integer, CultureInfo.InvariantCulture, out var level))
            {
                // Excel sometimes stores numbers as floating strings
                if (double.TryParse(levelText, NumberStyles.Float, CultureInfo.InvariantCulture, out var levelDouble))
                    level = (int)levelDouble;
                else
                    continue;
            }

            var mergedName = TreeTableConverter.MergeNameAndComment(name, comment);
            var isBold = ParseIsBold(isBoldText);
            parent = string.IsNullOrWhiteSpace(parent) ? null : parent.Trim();

            if (string.IsNullOrWhiteSpace(id))
                id = (rows.Count + 1).ToString("D4", CultureInfo.InvariantCulture);

            var (cleanName, cleanComment) = TreeTableConverter.SplitNameAndComment(
                TreeTableConverter.MergeNameAndComment(name, comment));

            rows.Add(new TableRow(id.Trim(), level, cleanName, cleanComment, isBold, parent, orderIndex++));
        }

        return rows;
    }

    private static Dictionary<string, int> BuildHeaderMap(IXLRangeRow headerRow)
    {
        var map = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        foreach (var cell in headerRow.CellsUsed())
        {
            var header = (cell.GetString() ?? string.Empty).Trim();
            if (string.IsNullOrWhiteSpace(header))
                continue;

            map[NormalizeHeader(header)] = cell.Address.ColumnNumber;
        }

        return map;
    }

    private static string GetCellString(IXLRangeRow row, Dictionary<string, int> headerMap, string headerKey)
    {
        if (!headerMap.TryGetValue(headerKey, out var col))
            return "";

        var cell = row.Cell(col);
        return (cell.GetString() ?? string.Empty).Trim();
    }

    private static string NormalizeHeader(string header)
    {
        return header
            .Replace(" ", string.Empty, StringComparison.Ordinal)
            .Replace("_", string.Empty, StringComparison.Ordinal)
            .Trim()
            .ToLowerInvariant();
    }

    private static bool ParseIsBold(string s)
    {
        s = (s ?? string.Empty).Trim();
        if (s.Equals("1", StringComparison.OrdinalIgnoreCase)) return true;
        if (s.Equals("true", StringComparison.OrdinalIgnoreCase)) return true;
        if (s.Equals("yes", StringComparison.OrdinalIgnoreCase)) return true;
        if (double.TryParse(s, NumberStyles.Float, CultureInfo.InvariantCulture, out var d))
            return Math.Abs(d) > 0;
        return false;
    }
}
