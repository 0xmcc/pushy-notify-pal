export type RpsGame = {
  "version": "0.1.0",
  "name": "rps_game",
  "instructions": [
    {
      "name": "createPlayer",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "playerAccount",
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
      "args": []
    },
    {
      "name": "createGame",
      "accounts": [
        {
          "name": "playerOne",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gameAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameVault",
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
          "name": "timestamp",
          "type": "i64"
        },
        {
          "name": "betAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "joinGame",
      "accounts": [
        {
          "name": "playerTwo",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gameAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "commitMove",
      "accounts": [
        {
          "name": "player",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "game",
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
          "name": "commitment",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "revealMove",
      "accounts": [
        {
          "name": "player",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "opponent",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "opponentVault",
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
          "name": "commitedMove",
          "type": "u8"
        },
        {
          "name": "salt",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "claimWinnings",
      "accounts": [
        {
          "name": "player",
          "isMut": true,
          "isSigner": true
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
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "deletePlayer",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "playerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "deleteGame",
      "accounts": [
        {
          "name": "playerOne",
          "isMut": true,
          "isSigner": true
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
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "playerOne",
            "type": "publicKey"
          },
          {
            "name": "playerTwo",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "playerOneCommitment",
            "type": {
              "option": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          },
          {
            "name": "playerTwoCommitment",
            "type": {
              "option": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          },
          {
            "name": "playerOneMove",
            "type": {
              "option": {
                "defined": "Move"
              }
            }
          },
          {
            "name": "playerTwoMove",
            "type": {
              "option": {
                "defined": "Move"
              }
            }
          },
          {
            "name": "state",
            "type": {
              "defined": "GameState"
            }
          },
          {
            "name": "winner",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "betAmount",
            "type": "u64"
          },
          {
            "name": "vault",
            "type": "publicKey"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "player",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "vault",
            "type": "publicKey"
          },
          {
            "name": "gamesPlayed",
            "type": "u16"
          },
          {
            "name": "wins",
            "type": "u16"
          },
          {
            "name": "losses",
            "type": "u16"
          },
          {
            "name": "draws",
            "type": "u16"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "GameState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Active"
          },
          {
            "name": "Finished"
          }
        ]
      }
    },
    {
      "name": "Move",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Rock"
          },
          {
            "name": "Paper"
          },
          {
            "name": "Scissors"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidMove",
      "msg": "Invalid move"
    },
    {
      "code": 6001,
      "name": "InvalidHash",
      "msg": "Invalid hash"
    },
    {
      "code": 6002,
      "name": "MoveAlreadyMade",
      "msg": "Move already made"
    },
    {
      "code": 6003,
      "name": "InvalidPlayer",
      "msg": "Invalid player"
    },
    {
      "code": 6004,
      "name": "GameNotActive",
      "msg": "Game is not active"
    },
    {
      "code": 6005,
      "name": "InvalidGameState",
      "msg": "Game is not in the correct state for that operation."
    },
    {
      "code": 6006,
      "name": "PlayerTwoAlreadySet",
      "msg": "Player two is already set."
    },
    {
      "code": 6007,
      "name": "PlayerTwoNotSet",
      "msg": "Player two is not set."
    },
    {
      "code": 6008,
      "name": "InsufficientFunds",
      "msg": "Insufficient funds"
    },
    {
      "code": 6009,
      "name": "InvalidTimestamp",
      "msg": "Invalid timestamp for game creation"
    },
    {
      "code": 6010,
      "name": "PlayerNotInGame",
      "msg": "Player not in game"
    },
    {
      "code": 6011,
      "name": "InvalidOpponent",
      "msg": "Invalid opponent"
    }
  ]
};

export const IDL: RpsGame = {
  "version": "0.1.0",
  "name": "rps_game",
  "instructions": [
    {
      "name": "createPlayer",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "playerAccount",
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
      "args": []
    },
    {
      "name": "createGame",
      "accounts": [
        {
          "name": "playerOne",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gameAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameVault",
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
          "name": "timestamp",
          "type": "i64"
        },
        {
          "name": "betAmount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "joinGame",
      "accounts": [
        {
          "name": "playerTwo",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "gameAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "commitMove",
      "accounts": [
        {
          "name": "player",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "game",
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
          "name": "commitment",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "revealMove",
      "accounts": [
        {
          "name": "player",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "opponent",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "game",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "gameVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "playerVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "opponentVault",
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
          "name": "commitedMove",
          "type": "u8"
        },
        {
          "name": "salt",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        }
      ]
    },
    {
      "name": "claimWinnings",
      "accounts": [
        {
          "name": "player",
          "isMut": true,
          "isSigner": true
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
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "deletePlayer",
      "accounts": [
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "playerAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vault",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "deleteGame",
      "accounts": [
        {
          "name": "playerOne",
          "isMut": true,
          "isSigner": true
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
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "game",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "playerOne",
            "type": "publicKey"
          },
          {
            "name": "playerTwo",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "playerOneCommitment",
            "type": {
              "option": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          },
          {
            "name": "playerTwoCommitment",
            "type": {
              "option": {
                "array": [
                  "u8",
                  32
                ]
              }
            }
          },
          {
            "name": "playerOneMove",
            "type": {
              "option": {
                "defined": "Move"
              }
            }
          },
          {
            "name": "playerTwoMove",
            "type": {
              "option": {
                "defined": "Move"
              }
            }
          },
          {
            "name": "state",
            "type": {
              "defined": "GameState"
            }
          },
          {
            "name": "winner",
            "type": {
              "option": "publicKey"
            }
          },
          {
            "name": "betAmount",
            "type": "u64"
          },
          {
            "name": "vault",
            "type": "publicKey"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "player",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "publicKey"
          },
          {
            "name": "vault",
            "type": "publicKey"
          },
          {
            "name": "gamesPlayed",
            "type": "u16"
          },
          {
            "name": "wins",
            "type": "u16"
          },
          {
            "name": "losses",
            "type": "u16"
          },
          {
            "name": "draws",
            "type": "u16"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "GameState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Active"
          },
          {
            "name": "Finished"
          }
        ]
      }
    },
    {
      "name": "Move",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Rock"
          },
          {
            "name": "Paper"
          },
          {
            "name": "Scissors"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InvalidMove",
      "msg": "Invalid move"
    },
    {
      "code": 6001,
      "name": "InvalidHash",
      "msg": "Invalid hash"
    },
    {
      "code": 6002,
      "name": "MoveAlreadyMade",
      "msg": "Move already made"
    },
    {
      "code": 6003,
      "name": "InvalidPlayer",
      "msg": "Invalid player"
    },
    {
      "code": 6004,
      "name": "GameNotActive",
      "msg": "Game is not active"
    },
    {
      "code": 6005,
      "name": "InvalidGameState",
      "msg": "Game is not in the correct state for that operation."
    },
    {
      "code": 6006,
      "name": "PlayerTwoAlreadySet",
      "msg": "Player two is already set."
    },
    {
      "code": 6007,
      "name": "PlayerTwoNotSet",
      "msg": "Player two is not set."
    },
    {
      "code": 6008,
      "name": "InsufficientFunds",
      "msg": "Insufficient funds"
    },
    {
      "code": 6009,
      "name": "InvalidTimestamp",
      "msg": "Invalid timestamp for game creation"
    },
    {
      "code": 6010,
      "name": "PlayerNotInGame",
      "msg": "Player not in game"
    },
    {
      "code": 6011,
      "name": "InvalidOpponent",
      "msg": "Invalid opponent"
    }
  ]
};
