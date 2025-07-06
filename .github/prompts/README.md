# Prompt Files (experimental)

This folder contains example prompt files (experimental) for GitHub Copilot. For more information on how to use these, see the [GitHub Copilot prompt files](https://code.visualstudio.com/docs/copilot/copilot-customization#_prompt-files-experimental).

## Prompt Files Index

A list of prompt files available in this repository:

| File Name | Description | Parameters |
|-----------|-------------|------------|
| [create_github_issues_for_unmet_spec_requirements.prompt.md](create_github_issues_for_unmet_spec_requirements.prompt.md) | Create GitHub issues for unmet specification requirements | `${input:specFile}` |
| [create_github_issue_feature_from_spec.prompt.md](create_github_issue_feature_from_spec.prompt.md) | Create a GitHub issue for a new feature from specification | `${input:specFile}` |
| [create_plan.prompt.md](create_plan.prompt.md) | Create a project plan from requirements | `${input:PlanPurpose}` |
| [create_spec.prompt.md](create_spec.prompt.md) | Create a technical specification document | `${input:SpecPurpose}` |
| [dotnet_best_practices.prompt.md](dotnet_best_practices.prompt.md) | Review .NET code for best practices |  |
| [dotnet_design_pattern_review.prompt.md](dotnet_design_pattern_review.prompt.md) | Review .NET code for design patterns | `${selection}` |
| [update_avm_modules_in_bicep.prompt.md](update_avm_modules_in_bicep.prompt.md) | Update Azure Verified Modules to latest versions in Bicep files | `${file}` |
| [update_llms.prompt.md](update_llms.prompt.md) | Update large language model references |   |
| [update_markdown_file_index.prompt.md](update_markdown_file_index.prompt.md) | Update a markdown file section with an index/table of files from a specified folder | `${file}`, `${input:folder}`, `${input:pattern}` |
| [update_plan.prompt.md](update_plan.prompt.md) | Update an existing project plan | `${input:PlanPurpose}` |
| [update_spec.prompt.md](update_spec.prompt.md) | Update an existing technical specification | `${input:SpecPurpose}` |

## Usage

To use these prompt files:

1. Copy the desired `.prompt.md` file from this folder to your VS Code user settings folder or workspace `.github/prompts` folder
1. Access the prompt file through the chat interface in VS Code by typing `/` and selecting the prompt from the list

    ![Prompt file execution in Visual Studio Code](images/run-custom-prompt-file.png)
