# hackaton-starton - Ch3ck0ut

## What Ch3ck0ut is about ?
Ch3ck0ut is a solution to **deploy and manage ERC-721 contract** without coding.

We used [Starton](https://www.starton.io/) to manage the contract and [Paper.xyz](https://paper.xyz/) to improve the user experience during the mint.

## What have we done ?
We wrote a frontend to deploy the contract via Starton through a very simple form. We also developed an ERC-721 contract based on a [Starton template](https://github.com/starton-io/smart-contract-templates/blob/master/contracts/StartonERC721Capped.sol) and some importants (almost mandatories, from our point of view) features that was missing.

List of the features:
- The deployment form of the contract on Starton
- Starton interface to manage the contract

- Paper integration who allow to create custom checkout links for the mint

Starton:
- Nft Collection with name, symbol.
- Limited suppply for the tokens and associated metadata
- Possibility to burn a token or stop the NFT sale

Our Contract:
- [Paper.xyz](https://paper.xyz/) integration, which implies change mint functions (**the pain point**)
- Private sale function, differs from public mint, reserve to [Paper.xyz](https://paper.xyz/)
- Optional price for Nft Minting (in native token)

## Links
- https://hackaton-starton-tau.vercel.app/
- https://www.starton.io/
- https://paper.xyz/

## Vidéo
https://www.loom.com/share/f94162a8e0024dd6ae1625dec63f66fa


## The team

[JH AKA BipBop](https://twitter.com/thebiptomybop)

![BipBop](https://pbs.twimg.com/profile_images/1558436910409945088/Zg53OinY_200x200.jpg)

[Nadar](https://twitter.com/zknadar)

![Nadar](https://pbs.twimg.com/profile_images/1440260567504068613/MlmWoVOu_200x200.jpg)

[Sinane](https://twitter.com/sinane_eth)

![Sinane](https://pbs.twimg.com/profile_images/1537693690872877058/D1zxwSja_200x200.jpg)
