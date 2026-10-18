$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$documentPath = Join-Path $projectRoot 'submission\BaoCao_Assignment2_PC-Astral-Market.docx'
$pdfPath = Join-Path $projectRoot 'tmp\report\report.pdf'
$wordInstance = $null
$reportDocument = $null

function Set-IndexStyle($document, [int]$styleId, [double]$indent, [int]$bold) {
    $style = $document.Styles.Item($styleId)
    $style.Font.Name = 'Times New Roman'
    $style.Font.Size = 11
    $style.Font.Bold = $bold
    $style.Font.Color = 0
    $format = $style.ParagraphFormat
    $format.LineSpacingRule = 0
    $format.SpaceAfter = 4
    $format.SpaceBefore = 0
    $format.LeftIndent = $wordInstance.CentimetersToPoints($indent)
    $format.FirstLineIndent = 0
    $format.RightIndent = 0
    $format.KeepWithNext = 0
    $format.TabStops.ClearAll()
    $format.TabStops.Add($wordInstance.CentimetersToPoints(16), 2, 1) | Out-Null
}

function Update-ReportIndexes($document) {
    # Built-in style IDs work regardless of the Word display language.
    Set-IndexStyle $document -20 0 -1
    Set-IndexStyle $document -21 0.6 0
    Set-IndexStyle $document -36 0 0
    foreach ($toc in $document.TablesOfContents) {
        $toc.UpperHeadingLevel = 1
        $toc.LowerHeadingLevel = 2
        $toc.RightAlignPageNumbers = $true
        $toc.IncludePageNumbers = $true
        $toc.TabLeader = 1
        $toc.Update()
    }
    foreach ($tof in $document.TablesOfFigures) {
        $tof.RightAlignPageNumbers = $true
        $tof.IncludePageNumbers = $true
        $tof.TabLeader = 1
        $tof.Update()
    }
    # Updating a field can recreate paragraph formatting; set the leader again.
    $indexes = @($document.TablesOfContents) + @($document.TablesOfFigures)
    foreach ($index in $indexes) {
        $index.Range.Font.Name = 'Times New Roman'
        $index.Range.Font.Size = 11
        $index.Range.Font.Color = 0
        foreach ($paragraph in $index.Range.Paragraphs) {
            $isLevelTwo = $paragraph.Style.NameLocal -eq $document.Styles.Item(-21).NameLocal
            $isLevelOne = $paragraph.Style.NameLocal -eq $document.Styles.Item(-20).NameLocal
            $paragraph.Range.Font.Bold = [int]$isLevelOne * -1
            $format = $paragraph.Format
            $format.LineSpacingRule = 0
            $format.SpaceAfter = 4
            $format.SpaceBefore = 0
            $format.LeftIndent = $wordInstance.CentimetersToPoints($(if ($isLevelTwo) { 0.6 } else { 0 }))
            $format.FirstLineIndent = 0
            $format.RightIndent = 0
            $format.KeepWithNext = 0
            $format.TabStops.ClearAll()
            $format.TabStops.Add($wordInstance.CentimetersToPoints(16), 2, 1) | Out-Null
        }
    }
    $document.Repaginate()
    foreach ($toc in $document.TablesOfContents) { $toc.UpdatePageNumbers() }
    foreach ($tof in $document.TablesOfFigures) { $tof.UpdatePageNumbers() }
}

try {
    $wordInstance = New-Object -ComObject Word.Application
    $wordInstance.Visible = $false
    $wordInstance.DisplayAlerts = 0
    $reportDocument = $wordInstance.Documents.Open($documentPath, $false, $false)
    $reportDocument.Fields.Update() | Out-Null
    Update-ReportIndexes $reportDocument
    $reportDocument.Save()
    # Reopen and update only the fields, as a student would do with F9.
    $reportDocument.Close($false)
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($reportDocument) | Out-Null
    $reportDocument = $wordInstance.Documents.Open($documentPath, $false, $false)
    $reportDocument.Fields.Update() | Out-Null
    foreach ($toc in $reportDocument.TablesOfContents) { $toc.Update() }
    foreach ($tof in $reportDocument.TablesOfFigures) { $tof.Update() }
    $reportDocument.Repaginate()
    foreach ($toc in $reportDocument.TablesOfContents) { $toc.UpdatePageNumbers() }
    foreach ($tof in $reportDocument.TablesOfFigures) { $tof.UpdatePageNumbers() }
    foreach ($index in (@($reportDocument.TablesOfContents) + @($reportDocument.TablesOfFigures))) {
        if ($index.TabLeader -ne 1 -or -not $index.RightAlignPageNumbers) {
            throw 'Index leader or page alignment changed after reopening and updating.'
        }
    }
    $reportDocument.Save()
    $reportDocument.ExportAsFixedFormat($pdfPath, 17)
    Write-Output "Pages: $($reportDocument.ComputeStatistics(2))"
    Write-Output $pdfPath
} finally {
    if ($null -ne $reportDocument) { $reportDocument.Close($false) }
    if ($null -ne $wordInstance) { $wordInstance.Quit() }
    if ($null -ne $reportDocument) { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($reportDocument) | Out-Null }
    if ($null -ne $wordInstance) { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($wordInstance) | Out-Null }
}
