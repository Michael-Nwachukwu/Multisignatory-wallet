// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.24;

import "./Multisig.sol";

contract MultisigFactory {
    Multisig[] multiSigClones;

    function createMultiSigFactory(uint256 _quorum, address[] memory _validSigners) external returns (Multisig newMulsig_, uint256 length_) { 
        newMulsig_ = new Multisig(_quorum, _validSigners);

        multiSigClones.push(newMulsig_);

        length_ = multiSigClones.length;
    }

    function getMultiSigClones() external view returns (Multisig[] memory) {
        return multiSigClones;
    }
}