Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$publicDir = Join-Path $root "public"

if (-not (Test-Path $publicDir)) {
  New-Item -ItemType Directory -Path $publicDir | Out-Null
}

function New-Brush([string]$color) {
  return New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml($color))
}

function New-Pen([string]$color, [float]$width) {
  $pen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml($color), $width)
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  return $pen
}

function New-RoundedPath([float]$x, [float]$y, [float]$width, [float]$height, [float]$radius) {
  $diameter = $radius * 2
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
  $path.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
  $path.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function Draw-BrandMark($graphics, [float]$x, [float]$y, [float]$size) {
  $pen = New-Pen "#38bdf8" ($size * 0.09)
  $amberBrush = New-Brush "#fbbf24"
  $whiteBrush = New-Brush "#f8fafc"

  # Handle (bottom stem)
  $graphics.DrawLine(
    $pen,
    (New-Object System.Drawing.PointF ($x + $size * 0.50), ($y + $size * 0.86)),
    (New-Object System.Drawing.PointF ($x + $size * 0.50), ($y + $size * 0.54))
  )

  # Center prong
  $graphics.DrawLine(
    $pen,
    (New-Object System.Drawing.PointF ($x + $size * 0.50), ($y + $size * 0.54)),
    (New-Object System.Drawing.PointF ($x + $size * 0.50), ($y + $size * 0.18))
  )

  # Left prong
  $graphics.DrawBezier(
    $pen,
    (New-Object System.Drawing.PointF ($x + $size * 0.50), ($y + $size * 0.54)),
    (New-Object System.Drawing.PointF ($x + $size * 0.43), ($y + $size * 0.41)),
    (New-Object System.Drawing.PointF ($x + $size * 0.32), ($y + $size * 0.34)),
    (New-Object System.Drawing.PointF ($x + $size * 0.23), ($y + $size * 0.22))
  )

  # Right prong
  $graphics.DrawBezier(
    $pen,
    (New-Object System.Drawing.PointF ($x + $size * 0.50), ($y + $size * 0.54)),
    (New-Object System.Drawing.PointF ($x + $size * 0.57), ($y + $size * 0.41)),
    (New-Object System.Drawing.PointF ($x + $size * 0.68), ($y + $size * 0.34)),
    (New-Object System.Drawing.PointF ($x + $size * 0.77), ($y + $size * 0.22))
  )

  # Tip nodes
  $r = $size * 0.06
  $graphics.FillEllipse($amberBrush, $x + $size * 0.23 - $r, $y + $size * 0.21 - $r, $r * 2, $r * 2)
  $graphics.FillEllipse($whiteBrush, $x + $size * 0.50 - $r, $y + $size * 0.17 - $r, $r * 2, $r * 2)
  $graphics.FillEllipse($amberBrush, $x + $size * 0.77 - $r, $y + $size * 0.21 - $r, $r * 2, $r * 2)

  $pen.Dispose()
  $amberBrush.Dispose()
  $whiteBrush.Dispose()
}

function Save-Png([string]$fileName, [int]$width, [int]$height, [scriptblock]$draw) {
  $bitmap = New-Object System.Drawing.Bitmap($width, $height)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $rect = New-Object System.Drawing.Rectangle 0, 0, $width, $height
  $bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $rect,
    [System.Drawing.ColorTranslator]::FromHtml("#0f172a"),
    [System.Drawing.ColorTranslator]::FromHtml("#0b1120"),
    45
  )
  $graphics.FillRectangle($bg, $rect)

  $glowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(26, 56, 189, 248))
  $graphics.FillEllipse($glowBrush, -($width * 0.08), -($height * 0.10), $width * 0.72, $height * 0.62)

  & $draw $graphics

  $bitmap.Save((Join-Path $publicDir $fileName), [System.Drawing.Imaging.ImageFormat]::Png)

  $glowBrush.Dispose()
  $bg.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

Save-Png "favicon-192.png" 192 192 {
  param($graphics)
  Draw-BrandMark $graphics 18 18 156
}

Save-Png "favicon-512.png" 512 512 {
  param($graphics)
  Draw-BrandMark $graphics 52 52 408
}

Save-Png "apple-touch-icon.png" 180 180 {
  param($graphics)
  Draw-BrandMark $graphics 16 16 148
}

Save-Png "og-image.png" 1200 630 {
  param($graphics)

  $outlinePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(28, 148, 163, 184), 2)
  $outlinePath = New-RoundedPath 40 40 1120 550 28
  $graphics.DrawPath($outlinePen, $outlinePath)

  Draw-BrandMark $graphics 92 114 170

  $labelBrush = New-Brush "#7dd3fc"
  $titleBrush = New-Brush "#f8fafc"
  $bodyBrush = New-Brush "#cbd5e1"
  $panelBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(32, 15, 23, 42))
  $linePen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(64, 148, 163, 184), 3)

  $fontFamily = New-Object System.Drawing.FontFamily("Segoe UI")
  $labelFont = New-Object System.Drawing.Font($fontFamily, 20, [System.Drawing.FontStyle]::Bold)
  $titleFont = New-Object System.Drawing.Font($fontFamily, 46, [System.Drawing.FontStyle]::Bold)
  $bodyFont = New-Object System.Drawing.Font($fontFamily, 22, [System.Drawing.FontStyle]::Regular)
  $chipFont = New-Object System.Drawing.Font($fontFamily, 18, [System.Drawing.FontStyle]::Bold)

  $graphics.DrawString("MERMAID STUDIO", $labelFont, $labelBrush, 288, 118)
  $graphics.DrawString("Live Mermaid diagram editor", $titleFont, $titleBrush, 288, 154)
  $graphics.DrawString("Write, preview, theme, and export diagrams locally at mermaidstudio.app.", $bodyFont, $bodyBrush, (New-Object System.Drawing.RectangleF 288, 236, 760, 86))

  $panelPath = New-RoundedPath 288 334 780 164 26
  $graphics.FillPath($panelBrush, $panelPath)

  $graphics.DrawString("flowchart LR", $chipFont, $labelBrush, 322, 366)
  $graphics.DrawLine($linePen, 324, 410, 470, 410)
  $graphics.DrawLine($linePen, 506, 410, 642, 410)
  $graphics.DrawLine($linePen, 678, 410, 818, 410)
  $graphics.DrawLine($linePen, 854, 410, 1000, 410)
  $graphics.DrawString("Idea", $chipFont, $titleBrush, 334, 426)
  $graphics.DrawString("Write", $chipFont, $titleBrush, 514, 426)
  $graphics.DrawString("Render", $chipFont, $titleBrush, 690, 426)
  $graphics.DrawString("Export", $chipFont, $titleBrush, 866, 426)

  $graphics.DrawString("Live preview | Saved history | SVG / PNG / JPEG", $chipFont, $bodyBrush, 322, 470)

  $outlinePen.Dispose()
  $outlinePath.Dispose()
  $panelPath.Dispose()
  $labelBrush.Dispose()
  $titleBrush.Dispose()
  $bodyBrush.Dispose()
  $panelBrush.Dispose()
  $linePen.Dispose()
  $labelFont.Dispose()
  $titleFont.Dispose()
  $bodyFont.Dispose()
  $chipFont.Dispose()
  $fontFamily.Dispose()
}

Write-Host "Generated brand assets in $publicDir"