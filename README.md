# `order` CLI

`order` is a handly CLI tool that you can use to leverage LLM's to organize your files and folders.

## Try it out

### Install dependencies

To install dependencies:

```bash
bun install
```

### Generate a messy folder

We can use the CLI to generate a messy folder to illustrate the idea without having to use a local folder of your own.

```bash
$ bun run src/packages/cmd/index.ts generate-test-folder test-messy 
$ tree ./test-messy
test-messy
├── Backup_Old_Laptop
│   ├── Documents
│   │   ├── Untitled1.docx
│   │   └── report_final_final.docx
│   └── Photos
│       ├── img1.jpg
│       └── img2.jpg
├── Budget_2023.xlsx
├── Email_Drafts
│   └── Draft1.eml
├── Grocery List.txt
├── Ideas for Blog.txt
├── Invoice_Feb2023.pdf
├── Invoice_Jan2023.pdf
├── Meeting_Notes_2023-01-08.docx
├── Meeting_Notes_2023-01-15.docx
├── New Folder
├── New Folder (2)
├── Old_Essays
│   ├── Essay1.docx
│   └── Essay2.docx
├── Old_Project.zip
├── Party_Planning.docx
├── Random Notes.txt
├── Recipe.pdf
├── Screenshot_20230102.png
├── Screenshot_20230103.png
├── Scripts
│   ├── script1.py
│   └── test_script.js
├── Tax_Info_2022
│   ├── Donations.xlsx
│   └── W2.pdf
├── To Do List.xlsx
├── To Watch List.docx
├── Untitled Document.docx
├── Untitled Spreadsheet.xlsx
└── Vacation_Photos
    ├── IMG_1003.jpg
    ├── IMG_1004.jpg
    └── RandomImage.png

11 directories, 31 files
```

### Setting your OpenAI API Key using the `config` command

This will store your key in `~/.order/config.json`

```bash
$ bun run src/packages/cmd/index.ts config --openai-api-key sk-YOURKEY
$ cat ~/.order/config.json
{
  "openaiApiKey": "sk-YOURKEY"
}
```

### Using the `copy` command to organize the folder

> Warning -- GPT3.5 halucinates *a lot* and will sometimes output weird suggestions. Please confirm the output if you're using the `move` command.

You can override the model with the `--model` flag.

```bash
$ bun run src/packages/cmd/index.ts copy ./test-messy ./test-clean -d 1 --verbose
Copying files to ./test-clean
Cleaning ./test-messy to depth 1
Found 25 paths to clean
Cleaning ./test-messy to depth 1
Found 25 paths to clean

Found 8 files that will not be moved:
file
-------------------
/Backup_Old_Laptop/
/Email_Drafts/
/New Folder (2)/
/New Folder/
/Old_Essays/
/Scripts/
/Tax_Info_2022/
/Vacation_Photos/

Found 17 items that can be moved:
from                            to
----------------------------------------------------------------------------
/Budget_2023.xlsx               /Finance/Budget_2023.xlsx
/Grocery List.txt               /Personal/Grocery List.txt
/Ideas for Blog.txt             /Personal/Ideas for Blog.txt
/Invoice_Feb2023.pdf            /Finance/Invoices/Invoice_Feb2023.pdf
/Invoice_Jan2023.pdf            /Finance/Invoices/Invoice_Jan2023.pdf
/Meeting_Notes_2023-01-08.docx  /Work/Meetings/Meeting_Notes_2023-01-08.docx
/Meeting_Notes_2023-01-15.docx  /Work/Meetings/Meeting_Notes_2023-01-15.docx
/Old_Project.zip                /Projects/Old_Project.zip
/Party_Planning.docx            /Personal/Party_Planning.docx
/Random Notes.txt               /Personal/Random Notes.txt
/Recipe.pdf                     /Personal/Recipes/Recipe.pdf
/Screenshot_20230102.png        /Screenshots/Screenshot_20230102.png
/Screenshot_20230103.png        /Screenshots/Screenshot_20230103.png
/To Do List.xlsx                /Personal/To Do List.xlsx
/To Watch List.docx             /Personal/To Watch List.docx
/Untitled Document.docx         /Personal/Untitled Document.docx
/Untitled Spreadsheet.xlsx      /Personal/Untitled Spreadsheet.xlsx
Are you sure you want to copy these files?
(y/n): y

Directory has been cleaned :) 🪄
```

