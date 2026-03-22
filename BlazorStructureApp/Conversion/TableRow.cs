namespace BlazorStructureApp.Conversion;

public sealed record TableRow(
    string Id,
    int Level,
    string Name,
    string Comment,
    bool IsBold,
    string? ParentId,
    int OrderIndex
);
