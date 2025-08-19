// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract YourCollectible is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    uint256 public tokenIdCounter;

    constructor() ERC721("YourCollectible", "YCB") Ownable(msg.sender) {}

    // ✅ Sin espacios
  function _baseURI() internal pure override returns (string memory) {
    return "https://ipfs.io/ipfs/";
}

    // Mint con pago
    function mintItem(address to, string memory uri) public payable returns (uint256) {
        uint256 price = 0.01 ether;
        require(msg.value >= price, "Not enough ETH sent");

        tokenIdCounter++;
        uint256 tokenId = tokenIdCounter;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }

    // ✅ Override correcto: ERC721Enumerable redefine _update
    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return ERC721Enumerable._update(to, tokenId, auth);
    }

    // ✅ Override correcto
    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        ERC721Enumerable._increaseBalance(account, value);
    }

    // ✅ Override para tokenURI desde ERC721URIStorage
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return ERC721URIStorage.tokenURI(tokenId);
    }

    // ✅ Override para supportsInterface
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    // ✅ Agrega esta función para devolver el ether al owner
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}