// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Multisig {

    error UserNotSigner();
    error ZeroValueNotAllowed();
    error AddressZeroDetected();
    error InsufficientBalance();
    error InvalidTxId();
    error TransactionCompleted();
    error ApprovalsReached();
    error CantSignTwice();
    error QuorumTooSmall();
    error QuorumExceedsSigners();
    error InvalidNumberOfSigners();

    // Quorum - number of people to sign a tx before execution
    uint256 public quorum;
    uint256 public noOfValidSigners;
    uint256 public txCount;

    uint256 public quorumUpdateCount;

    constructor(uint256 _quorum, address[] memory _validSigners) {

        // require(_validSigners.length > 1, "Signers must be more than one");
        // require(_quorum > 1, "quorum too small");
        
        if (_validSigners.length < 1) revert InvalidNumberOfSigners();
        if (_quorum <= 1) revert QuorumTooSmall();

        for (uint256 i = 0; i < _validSigners.length; i++) {
            if (_validSigners[i] == address(0)) revert AddressZeroDetected();
            require(!isValidSigner[_validSigners[i]], "signer exists");
            isValidSigner[_validSigners[i]] = true;
            // noOfValidSigners += 1;
        }

        noOfValidSigners = _validSigners.length; // typecasting to match the return valu type uin8

        if (!isValidSigner[msg.sender]) {
            isValidSigner[msg.sender] = true;
            noOfValidSigners++;
        }

        require(quorum <= noOfValidSigners, "Quorum should be less than valid signers");
        quorum = _quorum;
    }

    struct Transaction {
        uint256 id;
        uint256 amount;
        address sender;
        address recipient;
        address tokenAddress;
        bool isCompleted;
        uint256 timestamp;
        uint256 noOfApprovsals;
        address[] signers;
    }

    struct QuorumUpdate {
        uint256 id;
        uint8 newQuorum;
        bool isCompleted;
        uint256 noOfApprovals;
        address[] signers;
    }

    mapping (address => bool) public isValidSigner;
    mapping (uint256 => Transaction) public transactions;
    // signer - > txId -> bool (checking if a signer has signed)
    mapping (address => mapping (uint256 => bool)) public hasSigned;

    mapping (uint256 => QuorumUpdate) public quorumUpdates;


    function transfer(uint256 _amount, address _recipient, address _tokenAddress) external {

        if (msg.sender == address(0)) revert AddressZeroDetected();
        if (!isValidSigner[msg.sender]) revert UserNotSigner();
        if (_amount <= 0) revert ZeroValueNotAllowed();
        if (_recipient == address(0)) revert AddressZeroDetected();
        if (_tokenAddress == address(0)) revert AddressZeroDetected();

        uint256 _contractBalance = IERC20(_tokenAddress).balanceOf(address(this));
        if (_contractBalance < _amount) revert InsufficientBalance();

        uint256 _txId = txCount + 1;    
        Transaction storage trx = transactions[_txId];

        trx.id = _txId;
        trx.amount = _amount;
        trx.sender = msg.sender;
        trx.recipient = _recipient;
        trx.tokenAddress = _tokenAddress;
        trx.timestamp = block.timestamp;
        trx.noOfApprovsals += 1;
        trx.signers.push(msg.sender);

        hasSigned[msg.sender][_txId] = true;

        // Here we are actually updating the state of txCount
        txCount + 1;

    }

    function approveTx(uint8 _txId) external {
        Transaction storage trx = transactions[_txId];

        if (trx.id == 0) revert InvalidTxId();

        uint256 _contractBalance = IERC20(trx.tokenAddress).balanceOf(address(this));
        if (_contractBalance < trx.amount) revert InsufficientBalance();

        if (trx.isCompleted) revert TransactionCompleted();
        if (trx.noOfApprovsals >= quorum) revert ApprovalsReached();
        if (hasSigned[msg.sender][_txId]) revert CantSignTwice();
        if (!isValidSigner[msg.sender]) revert UserNotSigner();

        hasSigned[msg.sender][_txId] = true;
        trx.noOfApprovsals += 1;
        trx.signers.push(msg.sender);

        if (trx.noOfApprovsals == quorum) {
            trx.isCompleted = true;
            IERC20(trx.tokenAddress).transfer(trx.recipient, trx.amount);
        }
    }

    // function approveTx(uint8 _txId) external {

    //     Transaction storage trx = transactions[_txId];

    //     require(trx.id != 0, "invalid tx id");
        
    //     require(IERC20(trx.tokenAddress).balanceOf(address(this)) >= trx.amount, "insufficient funds");
    //     require(!trx.isCompleted, "transaction already completed");
    //     require(trx.noOfApprovsals < quorum, "approvals already reached");

        
    //     require(isValidSigner[msg.sender], "not a valid signer");
    //     require(!hasSigned[msg.sender][_txId], "can't sign twice");

    //     hasSigned[msg.sender][_txId] = true;
    //     trx.noOfApprovsals += 1;
    //     trx.signers.push(msg.sender);

    //     if(trx.noOfApprovsals == quorum) {
    //         trx.isCompleted = true;
    //         IERC20(trx.tokenAddress).transfer(trx.recipient, trx.amount);
    //     }

    // }

    function updateQuorum(uint8 _newQuorum) external {

        if (msg.sender == address(0)) revert AddressZeroDetected();
        if (!isValidSigner[msg.sender]) revert UserNotSigner();

        if (_newQuorum <= 1) revert QuorumTooSmall();

        if (_newQuorum > noOfValidSigners) revert QuorumExceedsSigners();

        uint256 _updateId = txCount + 1;
        QuorumUpdate storage update = quorumUpdates[_updateId];

        update.id = _updateId;
        update.newQuorum = _newQuorum;
        update.noOfApprovals = 1;
        update.signers.push(msg.sender);

        hasSigned[msg.sender][_updateId] = true;

        quorumUpdateCount++;
    }

    function approveUpdateQuorum(uint256 _updateId) external {

        if (!isValidSigner[msg.sender]) revert UserNotSigner();

        QuorumUpdate storage update = quorumUpdates[_updateId];

        if (update.id == 0) revert InvalidTxId();
        if (update.isCompleted) revert TransactionCompleted();
        if (update.noOfApprovals >= quorum) revert ApprovalsReached();
        if (hasSigned[msg.sender][_updateId]) revert CantSignTwice();

        hasSigned[msg.sender][_updateId] = true;
        update.noOfApprovals++;
        update.signers.push(msg.sender);

        if (update.noOfApprovals == quorum) {
            update.isCompleted = true;
            quorum = update.newQuorum;
        }

    }

}