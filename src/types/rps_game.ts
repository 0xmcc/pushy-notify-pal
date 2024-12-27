import { Idl } from '@coral-xyz/anchor';

export interface RpsGame extends Idl {
  version: "0.1.0";
  name: "rps_game";
  instructions: [
    {
      name: "createGame";
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
    address: string; // Required by Idl interface
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