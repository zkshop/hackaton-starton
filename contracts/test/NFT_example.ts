import assert from "assert";

import { ethers, network } from "hardhat";
import { NFT_example } from "../typechain-types";

// todo: I can't find the type appropriately from hardhat-ethers
type SignerWithAddress = any;

describe("NFT Paper Test", () => {
  let NFTInstance: NFT_example;
  let accounts: SignerWithAddress[];

  // additional infos
  let maxSupply: number;
  let reserveSupply: number;
  let currentSupply: number = 0;

  let deployer: SignerWithAddress;

  before(async () => {
    accounts = await ethers.getSigners();
    assert(accounts.length > 0, "no account found ; you may want to update your .env with a MNEMONIC value.");
    deployer = accounts[0];

    // Deploy NFT Contract instance
    NFTInstance = await (await ethers.getContractFactory("NFT_example")).deploy("token_uri/", "contract_uri", "0x0c93b186B730985628C04DaDA34B681f38143615");// address of PaperKeyManager
    assert.strictEqual(
      deployer.address,
      await NFTInstance.signer.getAddress(),
      "Error: you must change the deployer value."
    );

    // fetch constants from contract
    maxSupply = (await NFTInstance.MAX_SUPPLY()).toNumber();
    reserveSupply = 300;

    // add ethers
    // https://hardhat.org/hardhat-network/reference/#hardhat-setbalance
    // await network.provider.send("hardhat_setBalance", [
    //   await account.getAddress(),
    //   "0xDE0B6B3A7640000", // ethers.utils.parseEther("1").toString(),
    // ]);
  });

  describe("basic tests", () => {
    it("should display its name", async () => {
      assert.strictEqual(await NFTInstance.name(), "NFT Paper Test");
      assert.strictEqual(await NFTInstance.symbol(), "NFTPT");
    });
  });

  describe("reserve tests", async () => {
    it("should reserve some NFTs for the team", async () => {
      // should be able to reserve even when no sale is active
      assert.strictEqual((await NFTInstance.isAllowListActive()), false);
      assert.strictEqual((await NFTInstance.isPublicSaleActive()), false);

      await NFTInstance.connect(deployer).reserve(deployer.address, reserveSupply);
      currentSupply += reserveSupply;
      assert.strictEqual(reserveSupply, (await NFTInstance.totalSupply()).toNumber());
      assert.strictEqual(reserveSupply, (await NFTInstance.balanceOf(deployer.address)).toNumber());
      assert.strictEqual(deployer.address, await NFTInstance.ownerOf(1));
      assert.strictEqual(deployer.address, await NFTInstance.ownerOf(reserveSupply));

      await NFTInstance.ownerOf(0).then(
        (_result: any) => {
          assert(false, "Error: The token 0 should not exist at all.");
        },
        (_error: any) => {
          // we expect it to fail
        }
      );
      await NFTInstance.ownerOf(301).then(
        (_result: any) => {
          assert(false, "Error: The token 301 should not exist yet.");
        },
        (_error: any) => {
          // we expect it to fail
        }
      );
    });
  });

  describe("allow list tests", async () => {
    it("should have no allowList sale active", async () => {
      assert.strictEqual(await NFTInstance.isAllowListActive(), false);
    });

    it("should activate the allow list sale", async () => {
      await NFTInstance.setAllowListActive(true);
      assert.strictEqual(await NFTInstance.isAllowListActive(), true);
    });
  });

  describe("mintToAllowList() tests", async () => {
    it.skip("todo: Tests must be done with Paper.xyz");
    
    it("should deactivate the allow list sale", async () => {
      await NFTInstance.setAllowListActive(false);
      assert.strictEqual(await NFTInstance.isAllowListActive(), false);
    });
  });

  describe("token URI tests", async () => {
    it("should revert on token 0", async () => {
      await NFTInstance.tokenURI(0).then(
        (_result: any) => {
          assert(false, "Error: There should be no token with ID 0.");
        },
        (_error: any) => {
          // we expect it to fail
        }
      );
    });

    it("should have no tokenURI set", async () => {
      assert.strictEqual(await NFTInstance.tokenURI(1), "token_uri/1.json");
    });

    it("should set the token URI", async () => {
      await NFTInstance.connect(deployer).setBaseURI(
        "ipfs://ok/"
      );
      const link = await NFTInstance.tokenURI(1);
      assert.strictEqual(link, "ipfs://ok/1.json");
      const another_link = await NFTInstance.tokenURI(42);
      assert.strictEqual(another_link, "ipfs://ok/42.json");
      console.log("Check the link manually: " + link);
    });
  });

  describe("contract URI tests", async () => {
    it("should have no contractURI set", async () => {
      assert.strictEqual(await NFTInstance.contractURI(), "contract_uri");
    });

    it("should set the token URI", async () => {
      await NFTInstance.connect(deployer).setContractURI(
        "ipfs://contract_uri_ok.json"
      );
      const link = await NFTInstance.contractURI();
      assert.strictEqual(link, "ipfs://contract_uri_ok.json");
    });
  });

  describe("mint tests", async () => {
    it("should activate the public sale", async () => {
      await NFTInstance.setPublicSaleActive(true);
      assert.strictEqual(await NFTInstance.isPublicSaleActive(), true);
    });

    it("account 1 to 200 should mint one token", async () => {
      currentSupply = reserveSupply;
      const minters = accounts.slice(1, 201);
      for (const account of minters) {
        await NFTInstance.connect(account).mintTo(account.address);

        assert.strictEqual((await NFTInstance.balanceOf(account.address)).toNumber(), 1);
        currentSupply += 1;
      }
      assert.strictEqual(currentSupply, reserveSupply + 200);
    });

    it("account 3 should not mint another token", async () => {
      const minter = accounts[3];
      await NFTInstance.connect(minter).mintTo(minter.address).then(
        (_result: any) => {
          assert(false, "Error: account 3 has already minted.");
        },
        (_error: any) => {
          // we expect it to fail
        }
      );

      // testing the "minting on behalf" feature
      const account = accounts[207];
      await NFTInstance.connect(account).mintTo(minter.address).then(
        (_result: any) => {
          assert(false, "Error: account 3 has already minted.");
        },
        (_error: any) => {
          // we expect it to fail
        }
      );
    });
  })

  describe("transfer tests", async () => {
    it("should not transfer a token without approval", async () => {
      const accountFrom = accounts[1];
      const accountTo = accounts[2];
      const balanceFrom = (await NFTInstance.balanceOf(accountFrom.address)).toNumber();
      const balanceTo = (await NFTInstance.balanceOf(accountTo.address)).toNumber();

      // NB: overloaded functions have to be accessed this way
      await NFTInstance.connect(accounts[0])
        ["safeTransferFrom(address,address,uint256)"](
          accountFrom.address,
          accountTo.address,
          reserveSupply + 1
        )
        .then(
          (_result: any) => {
            assert(false, "Error: the transfer caller has not been approved yet.");
          },
          (_error: any) => {
            // we expect it to fail
          }
        );

      assert.strictEqual(
        (await NFTInstance.balanceOf(accountFrom.address)).toNumber(),
        balanceFrom
      );
      assert.strictEqual((await NFTInstance.balanceOf(accountTo.address)).toNumber(), balanceTo);
      assert.strictEqual((await NFTInstance.totalSupply()).toNumber(), currentSupply);
    });

    it("account 1 should transfer token 1 to account 9", async () => {
      const accountFrom = accounts[1];
      const accountTo = accounts[9];
      const balanceFrom = (await NFTInstance.balanceOf(accountFrom.address)).toNumber();
      const balanceTo = (await NFTInstance.balanceOf(accountTo.address)).toNumber();

      await NFTInstance.connect(accountFrom)["safeTransferFrom(address,address,uint256)"](
        accountFrom.address,
        accountTo.address,
        reserveSupply + 1
      );

      assert.strictEqual(
        (await NFTInstance.balanceOf(accountFrom.address)).toNumber(),
        balanceFrom - 1
      );
      assert.strictEqual(
        (await NFTInstance.balanceOf(accountTo.address)).toNumber(),
        balanceTo + 1
      );
      assert.strictEqual((await NFTInstance.totalSupply()).toNumber(), currentSupply);
    });

    it("account 2 should transfer token 2 to account 9 on account 0 behalf", async () => {
      // accountFrom is owner
      const accountFrom = accounts[2];
      const accountTo = accounts[9];
      const accountApproved = accounts[0];
      const balanceFrom = (await NFTInstance.balanceOf(accountFrom.address)).toNumber();
      const balanceTo = (await NFTInstance.balanceOf(accountTo.address)).toNumber();
      const balanceApproved = (await NFTInstance.balanceOf(accountApproved.address)).toNumber();

      await NFTInstance.connect(accountFrom).approve(accountApproved.address, reserveSupply + 2);
      await NFTInstance.connect(accountApproved)["safeTransferFrom(address,address,uint256)"](
        accountFrom.address,
        accountTo.address,
        reserveSupply + 2
      );

      assert.strictEqual(
        (await NFTInstance.balanceOf(accountFrom.address)).toNumber(),
        balanceFrom - 1
      );
      assert.strictEqual(
        (await NFTInstance.balanceOf(accountTo.address)).toNumber(),
        balanceTo + 1
      );
      assert.strictEqual(
        (await NFTInstance.balanceOf(accountApproved.address)).toNumber(),
        balanceApproved
      );
      assert.strictEqual((await NFTInstance.totalSupply()).toNumber(), currentSupply);
    });

    it("account 9 should transfer its 2 tokens to account 1 & 2 on account 4 behalf", async () => {
      // accountFrom is owner of all NFTs used here
      const accountFrom = accounts[9];
      const accountTo1 = accounts[1];
      const accountTo2 = accounts[2];
      const accountApproved = accounts[4];
      const balanceFrom = (await NFTInstance.balanceOf(accountFrom.address)).toNumber();
      const balanceTo1 = (await NFTInstance.balanceOf(accountTo1.address)).toNumber();
      const balanceTo2 = (await NFTInstance.balanceOf(accountTo2.address)).toNumber();
      const balanceApproved = (await NFTInstance.balanceOf(accountApproved.address)).toNumber();

      await NFTInstance.connect(accountFrom).setApprovalForAll(accountApproved.address, true);
      await NFTInstance.connect(accountApproved)["safeTransferFrom(address,address,uint256)"](
        accountFrom.address,
        accountTo1.address,
        reserveSupply + 1
      );
      await NFTInstance.connect(accountApproved)["safeTransferFrom(address,address,uint256)"](
        accountFrom.address,
        accountTo2.address,
        reserveSupply + 2
      );

      assert.strictEqual(
        (await NFTInstance.balanceOf(accountFrom.address)).toNumber(),
        balanceFrom - 2
      );
      assert.strictEqual(
        (await NFTInstance.balanceOf(accountTo1.address)).toNumber(),
        balanceTo1 + 1
      );
      assert.strictEqual(
        (await NFTInstance.balanceOf(accountTo2.address)).toNumber(),
        balanceTo2 + 1
      );
      assert.strictEqual(
        (await NFTInstance.balanceOf(accountApproved.address)).toNumber(),
        balanceApproved
      );
      assert.strictEqual((await NFTInstance.totalSupply()).toNumber(), currentSupply);
    });
  });
});