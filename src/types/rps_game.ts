import { Idl } from '@coral-xyz/anchor';

// Define PROGRAM_ID at the top level
export const PROGRAM_ID = "8LCEgTSrryvRuX3AE46Pa1msev4CfPXZiiWzbg6Vk8bn";

export interface RpsGame extends Idl {
  version: "0.1.0";
  name: "rps_game";
  instructions: [
    {
      name: "createGame";
      discriminator: [number, number, number, number, number, number, number, number];
      accounts: [
        {
          name: "playerOne";
          isMut: true;
          isSigner: true;
        },
        {
          name: "playerTwo";
          isMut: false;
          isSigner: false;
        },
        {
          name: "gameAccount";
          isMut: true;
          isSigner: false;
        },
        {
          name: "vault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        }
      ];
      args: [
        {
          name: "betAmount";
          type: "u64";
        }
      ];
    }
  ];
  metadata: {
    address: string;
    name: "rps_game";
    version: "0.1.0";
    spec: "0.1.0";
  };
}

export const IDL: RpsGame = {
  version: "0.1.0",
  name: "rps_game",
  instructions: [
    {
      name: "createGame",
      discriminator: [0, 0, 0, 0, 0, 0, 0, 0], // Default discriminator, should be updated with actual values
      accounts: [
        {
          name: "playerOne",
          isMut: true,
          isSigner: true
        },
        {
          name: "playerTwo",
          isMut: false,
          isSigner: false
        },
        {
          name: "gameAccount",
          isMut: true,
          isSigner: false
        },
        {
          name: "vault",
          isMut: true,
          isSigner: false
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false
        }
      ],
      args: [
        {
          name: "betAmount",
          type: "u64"
        }
      ]
    }
  ],
  metadata: {
    address: PROGRAM_ID,
    name: "rps_game",
    version: "0.1.0",
    spec: "0.1.0"
  }
};