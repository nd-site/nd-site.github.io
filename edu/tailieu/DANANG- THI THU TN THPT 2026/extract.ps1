$word = New-Object -ComObject Word.Application
$word.Visible = $false
$docPath = Join-Path -Path $PSScriptRoot -ChildPath "DE-DA-DANANG25-26.docx"
$outPath = Join-Path -Path $PSScriptRoot -ChildPath "extracted_danang.txt"
$doc = $word.Documents.Open($docPath)
$text = $doc.Content.Text
$text | Out-File $outPath -Encoding UTF8
$doc.Close()
$word.Quit()
