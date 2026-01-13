# n8n-nodes-addigy

![Banner](https://addigy.com/wp-content/uploads/2022/11/Addigy-Logo-Horizontal.png)

This is an n8n community node that lets you interact with [Addigy](https://addigy.com/) - a full-featured Apple MDM (Mobile Device Management) platform.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Table of Contents

- [Installation](#installation)
- [Prerequisites](#prerequisites)
- [Credentials](#credentials)
- [Compatibility](#compatibility)
- [Features](#features)
  - [Resources](#resources)
- [Usage](#usage)
  - [Example Workflows](#example-workflows)
- [Operations](#operations)
- [Known Issues](#known-issues)
- [Contributing](#contributing)
- [License](#license)

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

### GUI

1. Go to **Settings > Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-addigy` in **Enter npm package name**
4. Agree to the [risks](https://docs.n8n.io/integrations/community-nodes/risks/) of using community nodes
5. Select **Install**

### Manual Installation

To get started install the package in your n8n root directory:

```bash
npm install n8n-nodes-addigy
```

For Docker-based deployments add the following line before the font installation command in your [n8n Dockerfile](https://github.com/n8n-io/n8n/blob/master/docker/images/n8n/Dockerfile):

```docker
RUN cd /usr/local/lib/node_modules/n8n && npm install n8n-nodes-addigy
```

## Prerequisites

- n8n installed (version 0.220.0 or above)
- An active Addigy account
- Addigy API credentials (v2 recommended)

## Credentials

To use this node, you'll need to configure your Addigy API credentials in n8n.

### Generating API v2 Credentials (Recommended)

1. Log in to your Addigy account
2. Navigate to **Account > API Tokens**
3. Click **Create New Token**
4. Give your token a descriptive name (e.g., "n8n Integration")
5. Select the appropriate permissions for your use case:
   - **Devices**: Read, Write (if you need to update devices or run commands)
   - **Policies**: Read, Write (if you need to manage policies)
   - **Alerts**: Read, Write (if you need to manage alerts)
   - **Applications**: Read, Write (if you need to deploy/remove applications)
   - **Facts**: Read, Write (if you need to manage custom facts)
   - **Instructions**: Read, Write (if you need to create/execute instructions)
6. Click **Create Token**
7. Copy the generated token immediately (you won't be able to see it again)

### Generating API v1 Credentials (Legacy)

> **Note**: API v1 will be deprecated on March 31, 2026. It's recommended to use API v2.

1. Log in to your Addigy account
2. Navigate to **Account > API Credentials**
3. Click **Generate New Credentials**
4. Copy your **Client ID** and **Client Secret**

### Configuring Credentials in n8n

1. In your n8n workflow, add an Addigy node
2. Click on **Create New Credential**
3. Select your API version:
   - **API v2**: Enter your API Token
   - **API v1**: Enter your Client ID and Client Secret
4. Enter your Addigy base URL (default: `https://prod.addigy.com`)
5. Click **Save**

The credential will automatically test the connection by attempting to fetch devices.

## Compatibility

- Tested with n8n version 1.0.0+
- Works with Addigy API v2 and v1 (v2 recommended)
- Compatible with self-hosted and cloud n8n instances

## Features

This node provides comprehensive access to the Addigy API, allowing you to automate Apple device management tasks.

### Resources

The Addigy node supports the following resources:

#### 🖥️ Device
Manage and monitor Apple devices in your organization.
- Get device information by ID
- List all devices with filtering options
- Get device facts (system information, hardware details, installed software)
- Update device properties (name, policy assignment, notes)
- Run commands on devices (restart, shutdown, lock, clear passcode, refresh facts)

#### 📋 Policy
Organize devices into policies with specific configurations.
- Create new policies
- Get policy details
- List all policies
- Update policy information
- Delete policies

#### 🚨 Alert
Monitor and respond to alerts from your device fleet.
- Get alert details
- List alerts with filters (device, policy, status, severity, date range)
- Resolve alerts with optional notes

#### 📦 Application
Deploy and manage applications across your device fleet.
- Get application information
- List available applications (public and custom software)
- Deploy applications to devices or policies
- Remove applications from devices or policies
- Configure auto-update and installation timing

#### 📊 Fact
Create and manage custom facts to collect device information.
- Create custom facts with shell scripts
- Get fact definitions
- List all custom facts
- Update fact collection scripts and frequency
- Delete custom facts

#### ⚙️ Instruction
Create and execute custom scripts on devices.
- Create reusable instruction scripts
- Get instruction details
- List all instructions
- Update instruction scripts and metadata
- Delete instructions
- Execute instructions on specific devices or policies

## Usage

### Basic Example: Get All Devices

1. Add an Addigy node to your workflow
2. Select **Device** as the resource
3. Select **Get Many** as the operation
4. Configure filters if needed (policy, status, device type)
5. Execute the workflow

### Advanced Example: Automated Alert Response

Create a workflow that monitors for critical alerts and automatically resolves them after running a remediation instruction:

1. **Schedule Trigger**: Run every 5 minutes
2. **Addigy Node (Get Alerts)**:
   - Resource: Alert
   - Operation: Get Many
   - Filters: Status = Open, Severity = Critical
3. **IF Node**: Check if alerts exist
4. **Addigy Node (Execute Instruction)**:
   - Resource: Instruction
   - Operation: Execute
   - Select remediation instruction
   - Target: Device (from alert data)
5. **Addigy Node (Resolve Alert)**:
   - Resource: Alert
   - Operation: Resolve
   - Alert ID: From alert data
   - Notes: "Automatically resolved via n8n workflow"

### Example Workflows

#### 1. Device Onboarding Automation
Automatically assign new devices to the correct policy based on device type:
```
Webhook Trigger → Addigy (Get Device) → Switch (by device type) → Addigy (Update Device - assign policy) → Slack (notify team)
```

#### 2. Software Deployment Campaign
Deploy an application to all devices in a specific policy:
```
Manual Trigger → Addigy (Get Policy) → Addigy (Deploy Application) → Email (send deployment report)
```

#### 3. Custom Fact Collection and Reporting
Collect custom facts from devices and generate a report:
```
Schedule Trigger → Addigy (Get Many Devices) → Addigy (Get Facts) → Google Sheets (append data) → Slack (send summary)
```

#### 4. Compliance Monitoring
Monitor devices for compliance issues and create tickets:
```
Schedule Trigger → Addigy (Get Alerts) → Filter (compliance alerts) → Jira (create issue) → Addigy (add alert notes)
```

## Operations

### Device Operations
| Operation | Description |
|-----------|-------------|
| Get | Retrieve a device by ID |
| Get Many | List devices with optional filters |
| Get Facts | Retrieve all facts for a specific device |
| Update | Update device properties |
| Run Command | Execute commands (restart, shutdown, lock, etc.) |

### Policy Operations
| Operation | Description |
|-----------|-------------|
| Create | Create a new policy |
| Get | Retrieve a policy by ID |
| Get Many | List all policies |
| Update | Update policy properties |
| Delete | Delete a policy |

### Alert Operations
| Operation | Description |
|-----------|-------------|
| Get | Retrieve an alert by ID |
| Get Many | List alerts with filters |
| Resolve | Mark an alert as resolved |

### Application Operations
| Operation | Description |
|-----------|-------------|
| Get | Retrieve an application by ID |
| Get Many | List available applications |
| Deploy | Deploy an application to devices/policies |
| Remove | Remove an application from devices/policies |

### Fact Operations
| Operation | Description |
|-----------|-------------|
| Create | Create a custom fact |
| Get | Retrieve a custom fact by name |
| Get Many | List all custom facts |
| Update | Update a custom fact |
| Delete | Delete a custom fact |

### Instruction Operations
| Operation | Description |
|-----------|-------------|
| Create | Create a new instruction |
| Get | Retrieve an instruction by ID |
| Get Many | List all instructions |
| Update | Update an instruction |
| Delete | Delete an instruction |
| Execute | Run an instruction on devices/policies |

## Known Issues

- **API v1 Deprecation**: API v1 will be deprecated on March 31, 2026. Please migrate to API v2.
- **Rate Limiting**: The Addigy API has a rate limit of 1,000 requests per 10 seconds. If exceeded, requests will be rejected for 24 hours. The node does not currently implement automatic rate limiting.
- **Pagination**: When fetching large datasets, be mindful of performance. Use the "Return All" option carefully.
- **Logo**: The current node icon is a placeholder. Replace with the official Addigy logo from their [media kit](https://addigy.com/media-kit/) for production use.

## Version History

### 1.0.0 (Initial Release)
- Support for 6 main resources: Device, Policy, Alert, Application, Fact, and Instruction
- API v2 and v1 authentication
- Comprehensive filtering and pagination
- Dynamic dropdowns for devices, policies, and applications
- Full CRUD operations where applicable

## Resources

- [Addigy API v2 Documentation](https://support.addigy.com/hc/en-us/articles/16938210315411-API-Documentation-v2)
- [Addigy Support](https://support.addigy.com/)
- [n8n Community Forum](https://community.n8n.io/)
- [n8n Documentation](https://docs.n8n.io/)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

If you encounter any issues or have questions:
- Open an issue in the [GitHub repository](https://github.com/ajoshuasmith/n8n-nodes-addigy/issues)
- Ask in the [n8n Community Forum](https://community.n8n.io/)

## License

[MIT](LICENSE.md)

---

## About Addigy

Addigy is a full-featured Apple MDM (Mobile Device Management) platform that helps organizations manage Mac, iPhone, iPad, and Apple TV devices. Learn more at [addigy.com](https://addigy.com/).

## Disclaimer

This is an unofficial community node and is not affiliated with or endorsed by Addigy. Use at your own risk.

---

Made with ❤️ for the n8n community
