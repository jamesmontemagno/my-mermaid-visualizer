using System.Text;
using BlazorStructureApp.Conversion;

namespace BlazorStructureApp.Api;

public static class ConvertEndpoints
{
    public static IEndpointRouteBuilder MapConvertEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapPost("/api/convert/tree-to-csv", async (HttpRequest request) =>
        {
            var tree = await ReadBodyAsStringAsync(request);
            var result = TreeTableConverter.TreeMarkdownToTable(tree);
            var csv = TreeTableConverter.TableRowsToCsv(result.Rows);
            return Results.Text(csv, "text/csv", Encoding.UTF8);
        });

        endpoints.MapPost("/api/convert/table-to-tree", async (HttpRequest request) =>
        {
            var table = await ReadBodyAsStringAsync(request);
            var rows = TreeTableConverter.ParseTableText(table);
            var tree = TreeTableConverter.TableRowsToTreeMarkdown(rows, title: "Current Status");
            return Results.Text(tree, "text/markdown", Encoding.UTF8);
        });

        return endpoints;
    }

    private static async Task<string> ReadBodyAsStringAsync(HttpRequest request)
    {
        request.EnableBuffering();
        request.Body.Position = 0;
        using var reader = new StreamReader(request.Body, Encoding.UTF8, detectEncodingFromByteOrderMarks: true, leaveOpen: true);
        var text = await reader.ReadToEndAsync();
        request.Body.Position = 0;
        return text;
    }
}
