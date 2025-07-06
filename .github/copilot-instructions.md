This is an Azure Developer CLI (AZD) solution accelerator for deploying Azure resources using modern Infrastructure as Code practices.

## Azure Developer CLI Overview

Azure Developer CLI (azd) is a developer-centric command-line interface (CLI) tool for creating Azure applications. It provides best practices and conventions for:
- Infrastructure as Code with Bicep templates
- Application deployment and lifecycle management
- Integration with CI/CD pipelines
- Local development environment setup

## Key Principles

The key principles you should adopt when creating Azure Developer CLI solution accelerators:

### Infrastructure as Code
- Use Azure Verified Modules (AVM) for all resources, including networking, security, and compute resources - wherever possible.
- Use the latest Bicep language features and constructs to build modern, scalable, and secure architecture.
- Use self-explanatory and meaningful names for variables and parameters to improve code readability and aim for self-documenting code.
- Always provide descriptions of parameters and outputs.
- Follow the Azure Developer CLI template structure and conventions.

### Azure Well-Architected Framework
- Prioritize the Azure Well-Architected Framework pillars in this order: Security, Operational Excellence, Performance Efficiency, Reliability, and Cost Optimization.
- Implement security best practices including managed identities, key vault integration, and network security.
- Design for monitoring and observability with Application Insights and Log Analytics.
- Consider cost optimization through appropriate SKUs and auto-scaling configurations.

### Development Experience
- Provide clear documentation and getting started guides.
- Include comprehensive parameter files for different environments (dev, test, prod).
- Implement proper error handling and validation in scripts.
- Use GitHub Actions or Azure DevOps for CI/CD pipeline automation.

## Implementation Guidance

When creating Infrastructure as Code for Azure Developer CLI solution accelerators:

### File Structure
- Follow the standard AZD template structure with `infra/`, `src/`, and root configuration files
- Use `azure.yaml` for service and pipeline configuration
- Organize Bicep templates in logical modules within the `infra/` directory
- Include environment-specific parameter files

### Best Practices
- Provide comprehensive guidance and best practices for developing reusable and reliable Infrastructure as Code using Bicep and PowerShell
- Prioritize Azure Well-Architected Framework pillars in this order: Security, Operational Excellence, Performance Efficiency, Reliability, and Cost Optimization
- Build CI/CD pipelines using GitHub Actions with the latest task versions wherever possible
- Include proper testing and validation steps in deployment pipelines
- Implement proper secret management and secure configuration practices

### Resource Naming and Tagging
- Use consistent naming conventions across all resources
- Implement comprehensive tagging strategy for cost management and governance
- Use Azure resource abbreviations as defined in Microsoft naming conventions

## Tools Integration

- @azure Rule - Use Azure Best Practices: When generating code for Azure, running terminal commands for Azure, or performing operations related to Azure, invoke your `azure_get_code_gen_best_practices` tool if available.
- @azure Rule - Use Azure Deployment Best Practices: When deploying to Azure or preparing applications for deployment to Azure, invoke your `azure_get_deployment_best_practices` tool if available.
