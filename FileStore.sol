// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract FileStore { 

    mapping (address => string[]) public IDs;

    function addFileIDs(string memory _id) external {
        IDs[msg.sender].push(_id);
    }

    function getFileLength() public view returns (uint) {
        return IDs[msg.sender].length;
    }
}