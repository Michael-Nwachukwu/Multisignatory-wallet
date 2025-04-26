# Multi-Signatory Wallet

This repository contains a multi-signature wallet smart contract. It employs a factory design pattern to efficiently clone and deploy individual multi-signature wallets for various users or groups. Built with TypeScript and Solidity, the project leverages the Hardhat development environment for a streamlined development workflow.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contribution Guidelines](#contribution-guidelines)
- [License](#license)

## Introduction

A multi-signature wallet enhances security by requiring approval from a predefined number of authorized parties (signatories) before any transaction can be executed. This collaborative approach significantly reduces the risk of unauthorized fund transfers. This type of wallet is particularly well-suited for group or organizational settings where collective decision-making is essential for managing digital assets.

## Features

- **Multi-Signature Transactions:** Transactions necessitate confirmation from a specified quorum of designated signatories before they can be processed.
- **Factory Pattern:** The implementation utilizes a factory contract to efficiently deploy new instances (clones) of the multi-signature wallet contract for different users or groups, minimizing deployment costs.
- **Hardhat Integration:** The project is fully integrated with Hardhat, providing a comprehensive environment for development, testing, and deployment.
- **Extensible Design:** The architecture is modular and designed for scalability, allowing for the future addition of new features and functionalities.
- **OpenZeppelin Standards:** Leverages secure and community-audited contract standards provided by the OpenZeppelin library.

## Technologies Used

- **TypeScript:** Used for scripting deployment processes, testing, and other automation tasks.
- **Solidity:** The programming language for developing the smart contracts.
- **Hardhat:** A development environment for Ethereum software, providing tools for compiling, testing, deploying, and interacting with smart contracts.
- **OpenZeppelin:** A library providing secure and reusable smart contract components.

## Installation

1.  **Clone the repository:**

    ```bash
    git clone [https://github.com/Michael-Nwachukwu/Multisignatory-wallet.git](https://github.com/Michael-Nwachukwu/Multisignatory-wallet.git)
    cd Multisignatory-wallet
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Compile the contracts:**

    ```bash
    npx hardhat compile
    ```

## Usage

1.  **Start the Hardhat local blockchain:**

    ```bash
    npx hardhat node
    ```

2.  **Deploy the contracts:**

    ```bash
    npx hardhat run scripts/deploy.ts --network localhost
    ```

3.  **Interact with the deployed contracts using Hardhat tasks:**

    ```bash
    npx hardhat help
    ```

## Testing

Run the test suite to ensure the smart contracts function as expected:

```bash
npx hardhat test
```

## Deployment
To deploy the contracts to a live network:

Configure the hardhat.config.ts file with the necessary network details (e.g., RPC URL, accounts).

Run the deployment script, specifying the target network:

```bash
npx hardhat run scripts/deploy.ts --network <network-name>
```

Replace <network-name> with the name of the network configured in hardhat.config.ts (e.g., sepolia, mainnet).

## Contribution Guidelines
I welcome contributions to this project! To contribute:

- Fork the repository to your GitHub account.
- Create a new branch dedicated to your feature or bug fix.
- Commit your changes with clear and concise commit messages.
- Open a pull request on the main repository, providing a detailed explanation of your changes.
License

This project is licensed under the MIT License. See the LICENSE file for complete license details.
