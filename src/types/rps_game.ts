export const IDL = {
  "version": "0.1.0",
  "name": "rps_game",
  "instructions": [
    {
      "name": "createGame",
      "accounts": [
        {
          "name": "playerOne",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "playerTwo",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "gameAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "betAmount",
          "type": "u64"
        }
      ]
    }
  ]
};