using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace BlazorStructureApp.Conversion;

public sealed record TreeToTableResult(string? Title, IReadOnlyList<TableRow> Rows);

public static class TreeTableConverter
{
    // Matches lines like:
    // "│   │   ├── Foo" or "├── Foo" or "└── **Foo**"
    private static readonly Regex TreeLineRegex =
        new(@"^(?<indent>(?:\|\s{3}|│\s{3}|\s{4})*)(?<branch>├──\s|└──\s)?(?<name>.*)$", RegexOptions.Compiled);

    public static TreeToTableResult TreeMarkdownToTable(string treeMarkdown)
    {
        if (treeMarkdown is null) throw new ArgumentNullException(nameof(treeMarkdown));

        var normalized = NormalizeNewlines(treeMarkdown);
        var lines = normalized.Split('\n');

        string? title = null;
        var index = 0;

        while (index < lines.Length && string.IsNullOrWhiteSpace(lines[index]))
            index++;

        if (index < lines.Length && !LooksLikeTreeNodeLine(lines[index]))
        {
            title = lines[index].TrimEnd('\r').Trim();
            index++;
        }

        var rows = new List<TableRow>();
        var lastIdByLevel = new Dictionary<int, string>();
        var nextId = 10;

        for (; index < lines.Length; index++)
        {
            var rawLine = lines[index].TrimEnd('\r');
            if (string.IsNullOrWhiteSpace(rawLine))
                continue;

            if (!LooksLikeTreeNodeLine(rawLine))
                continue;

            var match = TreeLineRegex.Match(rawLine);
            if (!match.Success)
                continue;

            var indent = match.Groups["indent"].Value;
            var name = match.Groups["name"].Value.TrimEnd();

            var indentGroups = indent.Length / 4;
            var level = indentGroups + 1;

            var (unbolded, isBold) = UnwrapBold(name);
            var (baseName, comment) = SplitNameAndComment(unbolded);

            var id = nextId.ToString("D4", CultureInfo.InvariantCulture);
            nextId += 10;

            string? parentId = null;
            if (level > 1 && lastIdByLevel.TryGetValue(level - 1, out var parent))
                parentId = parent;

            lastIdByLevel[level] = id;
            foreach (var k in lastIdByLevel.Keys.Where(k => k > level).ToArray())
                lastIdByLevel.Remove(k);

            rows.Add(new TableRow(
                Id: id,
                Level: level,
                Name: baseName,
                Comment: comment,
                IsBold: isBold,
                ParentId: parentId,
                OrderIndex: rows.Count
            ));
        }

        return new TreeToTableResult(title, rows);
    }

    public static IReadOnlyList<TableRow> ParseTableText(string tableText)
    {
        if (tableText is null) throw new ArgumentNullException(nameof(tableText));

        var normalized = NormalizeNewlines(tableText);
        var lines = normalized.Split('\n');

        var rows = new List<TableRow>();
        var delimiter = DetectDelimiter(lines);

        // Defaults for files without a header (legacy format):
        // ID, Level, Name, IsBold, Parent
        var columnMap = new ColumnMap(
            Id: 0,
            Level: 1,
            Name: 2,
            Comment: null,
            IsBold: 3,
            Parent: 4);

        foreach (var lineWithCr in lines)
        {
            var line = lineWithCr.TrimEnd('\r');
            if (string.IsNullOrWhiteSpace(line))
                continue;

            var cells = delimiter switch
            {
                '\t' => SplitTabs(line),
                ',' => SplitCsv(line),
                _ => SplitTabs(line)
            };

            if (cells.Count < 2)
                continue;

            // Header row?
            if (cells.Any(c => c.Equals("ID", StringComparison.OrdinalIgnoreCase))
                && cells.Any(c => c.Equals("Level", StringComparison.OrdinalIgnoreCase)))
            {
                columnMap = ColumnMap.FromHeader(cells);
                continue;
            }

            var id = GetCell(cells, columnMap.Id);
            var levelText = GetCell(cells, columnMap.Level);
            var name = GetCell(cells, columnMap.Name);
            var comment = columnMap.Comment is int commentIndex ? GetCell(cells, commentIndex) : "";
            var isBoldText = GetCell(cells, columnMap.IsBold);
            var parent = GetCell(cells, columnMap.Parent);

            if (!TryParseLevel(levelText, out var level))
                continue;

            // If there is no comment column, allow embedded comment like "Foo (bar)".
            if (string.IsNullOrWhiteSpace(comment))
            {
                var split = SplitNameAndComment(name);
                name = split.Name;
                comment = split.Comment;
            }
            else
            {
                comment = NormalizeComment(comment);
            }

            var isBold = ParseIsBold(isBoldText);
            parent = string.IsNullOrWhiteSpace(parent) ? null : parent.Trim();

            if (string.IsNullOrWhiteSpace(id))
                id = (rows.Count + 1).ToString("D4", CultureInfo.InvariantCulture);

            rows.Add(new TableRow(id.Trim(), level, name.Trim(), comment, isBold, parent, rows.Count));
        }

        return rows;
    }

    public static string TableRowsToCsv(IEnumerable<TableRow> rows)
    {
        var sb = new StringBuilder();
        sb.AppendLine("ID,Level,Name,Comment,IsBold,Parent");

        foreach (var row in rows)
        {
            sb.Append(CsvCell(row.Id));
            sb.Append(',');
            sb.Append(CsvCell(row.Level.ToString(CultureInfo.InvariantCulture)));
            sb.Append(',');
            sb.Append(CsvCell(row.Name));
            sb.Append(',');
            sb.Append(CsvCell(row.Comment ?? string.Empty));
            sb.Append(',');
            sb.Append(CsvCell(row.IsBold ? "1" : "0"));
            sb.Append(',');
            sb.Append(CsvCell(row.ParentId ?? string.Empty));
            sb.AppendLine();
        }

        return sb.ToString();
    }

    public static string TableRowsToTreeMarkdown(IEnumerable<TableRow> rows, string title = "Current Status")
    {
        var rowList = rows.OrderBy(r => r.OrderIndex).ToList();

        // If ParentId is missing, infer it from Level using order.
        var inferredParents = InferParentsWhenMissing(rowList);
        rowList = inferredParents;

        var nodes = rowList.ToDictionary(
            r => r.Id,
            r => new Node(r),
            StringComparer.OrdinalIgnoreCase);

        var roots = new List<Node>();

        foreach (var row in rowList)
        {
            var node = nodes[row.Id];

            if (!string.IsNullOrWhiteSpace(row.ParentId) && nodes.TryGetValue(row.ParentId!, out var parent))
            {
                parent.Children.Add(node);
                node.Parent = parent;
            }
            else
            {
                roots.Add(node);
            }
        }

        foreach (var node in nodes.Values)
            node.Children.Sort(static (a, b) => a.Row.OrderIndex.CompareTo(b.Row.OrderIndex));
        roots.Sort(static (a, b) => a.Row.OrderIndex.CompareTo(b.Row.OrderIndex));

        var sb = new StringBuilder();
        sb.AppendLine(string.IsNullOrWhiteSpace(title) ? "Current Status" : title.Trim());

        for (var i = 0; i < roots.Count; i++)
            RenderNode(sb, roots[i], prefix: "", isLast: i == roots.Count - 1);

        return sb.ToString();
    }

    internal static string MergeNameAndComment(string name, string? comment)
    {
        name = (name ?? string.Empty).Trim();
        comment = NormalizeComment(comment);

        if (string.IsNullOrWhiteSpace(comment))
            return name;

        return string.IsNullOrWhiteSpace(name) ? $"({comment})" : $"{name} ({comment})";
    }

    internal static (string Name, string Comment) SplitNameAndComment(string input)
    {
        input ??= string.Empty;
        var trimmed = input.Trim();

        // Detect a trailing " (comment)" segment.
        var match = Regex.Match(trimmed, @"^(?<name>.*?)(?:\s*\((?<comment>[^()]*)\)\s*)$", RegexOptions.CultureInvariant);
        if (match.Success)
        {
            var name = match.Groups["name"].Value.Trim();
            var comment = match.Groups["comment"].Value.Trim();
            if (!string.IsNullOrWhiteSpace(comment))
                return (name, comment);
        }

        return (trimmed, string.Empty);
    }

    private static void RenderNode(StringBuilder sb, Node node, string prefix, bool isLast)
    {
        sb.Append(prefix);
        sb.Append(isLast ? "└── " : "├── ");

        var merged = MergeNameAndComment(node.Row.Name, node.Row.Comment);
        var name = node.Row.IsBold ? $"**{merged}**" : merged;
        sb.AppendLine(name);

        var childPrefix = prefix + (isLast ? "    " : "│   ");
        for (var i = 0; i < node.Children.Count; i++)
            RenderNode(sb, node.Children[i], childPrefix, i == node.Children.Count - 1);
    }

    private static bool LooksLikeTreeNodeLine(string line)
    {
        if (string.IsNullOrWhiteSpace(line)) return false;
        return line.Contains("├──", StringComparison.Ordinal) || line.Contains("└──", StringComparison.Ordinal);
    }

    private static string NormalizeNewlines(string s) => s.Replace("\r\n", "\n").Replace("\r", "\n");

    private static (string Name, bool IsBold) UnwrapBold(string input)
    {
        var trimmed = input.Trim();
        if (trimmed.StartsWith("**", StringComparison.Ordinal) && trimmed.EndsWith("**", StringComparison.Ordinal) && trimmed.Length >= 4)
            return (trimmed[2..^2], true);
        return (trimmed, false);
    }

    private static bool TryParseLevel(string levelText, out int level)
    {
        level = 0;
        levelText = (levelText ?? string.Empty).Trim();
        if (int.TryParse(levelText, NumberStyles.Integer, CultureInfo.InvariantCulture, out level))
            return true;

        if (double.TryParse(levelText, NumberStyles.Float, CultureInfo.InvariantCulture, out var d))
        {
            level = (int)d;
            return true;
        }

        return false;
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

    private static string NormalizeComment(string? comment)
    {
        comment = (comment ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(comment)) return string.Empty;

        // Strip surrounding parentheses if present.
        if (comment.StartsWith("(", StringComparison.Ordinal) && comment.EndsWith(")", StringComparison.Ordinal) && comment.Length >= 2)
            comment = comment[1..^1].Trim();

        return comment;
    }

    private static List<TableRow> InferParentsWhenMissing(List<TableRow> rows)
    {
        var lastIdByLevel = new Dictionary<int, string>();
        var result = new List<TableRow>(rows.Count);

        foreach (var row in rows)
        {
            var parentId = row.ParentId;
            if (string.IsNullOrWhiteSpace(parentId) && row.Level > 1 && lastIdByLevel.TryGetValue(row.Level - 1, out var inferred))
                parentId = inferred;

            lastIdByLevel[row.Level] = row.Id;
            foreach (var k in lastIdByLevel.Keys.Where(k => k > row.Level).ToArray())
                lastIdByLevel.Remove(k);

            result.Add(row with { ParentId = parentId });
        }

        return result;
    }

    private static char DetectDelimiter(string[] lines)
    {
        foreach (var raw in lines)
        {
            var line = raw.TrimEnd('\r');
            if (string.IsNullOrWhiteSpace(line))
                continue;

            if (line.Contains('\t')) return '\t';
            if (line.Contains(',')) return ',';
        }

        return '\t';
    }

    private static List<string> SplitTabs(string line)
    {
        // Keep empty trailing cells
        return line.Split('\t').ToList();
    }

    private static List<string> SplitCsv(string line)
    {
        var result = new List<string>();
        var sb = new StringBuilder();
        var inQuotes = false;

        for (var i = 0; i < line.Length; i++)
        {
            var c = line[i];
            if (inQuotes)
            {
                if (c == '"')
                {
                    if (i + 1 < line.Length && line[i + 1] == '"')
                    {
                        sb.Append('"');
                        i++;
                    }
                    else
                    {
                        inQuotes = false;
                    }
                }
                else
                {
                    sb.Append(c);
                }

                continue;
            }

            if (c == '"')
            {
                inQuotes = true;
                continue;
            }

            if (c == ',')
            {
                result.Add(sb.ToString());
                sb.Clear();
                continue;
            }

            sb.Append(c);
        }

        result.Add(sb.ToString());
        return result;
    }

    private static string CsvCell(string value)
    {
        value ??= string.Empty;
        var mustQuote = value.Contains(',') || value.Contains('"') || value.Contains('\n') || value.Contains('\r') || value.Contains('\t');
        if (!mustQuote) return value;

        return '"' + value.Replace("\"", "\"\"", StringComparison.Ordinal) + '"';
    }

    private static string GetCell(IReadOnlyList<string> cells, int index)
    {
        if (index < 0 || index >= cells.Count) return string.Empty;
        return (cells[index] ?? string.Empty).Trim();
    }

    private readonly record struct ColumnMap(int Id, int Level, int Name, int? Comment, int IsBold, int Parent)
    {
        public static ColumnMap FromHeader(IReadOnlyList<string> header)
        {
            static string Norm(string s) => (s ?? string.Empty)
                .Trim()
                .Replace(" ", string.Empty, StringComparison.Ordinal)
                .Replace("_", string.Empty, StringComparison.Ordinal)
                .ToLowerInvariant();

            var map = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            for (var i = 0; i < header.Count; i++)
            {
                var key = Norm(header[i]);
                if (!string.IsNullOrWhiteSpace(key))
                    map[key] = i;
            }

            int Get(string key, int fallback) => map.TryGetValue(key, out var idx) ? idx : fallback;
            int? GetOpt(string key) => map.TryGetValue(key, out var idx) ? idx : null;

            var isBold = map.TryGetValue("isbold", out var b1)
                ? b1
                : (map.TryGetValue("bold", out var b2) ? b2 : 3);

            return new ColumnMap(
                Id: Get("id", 0),
                Level: Get("level", 1),
                Name: Get("name", 2),
                Comment: GetOpt("comment"),
                IsBold: isBold,
                Parent: Get("parent", 4));
        }
    }

    private sealed class Node
    {
        public Node(TableRow row) => Row = row;

        public TableRow Row { get; }
        public Node? Parent { get; set; }
        public List<Node> Children { get; } = new();
    }
}
