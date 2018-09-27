Below is an example that shows all features.
Right now I'm the only one developing this so this isn't very in detailed. Good luck.
```json
{
    "version": 0,
    "passwords": {
        "accounts.google.ca": [
            {
                "username": "username, OPTIONAL",
                "password": "password",
                "updated": 1538091024242, // Last updated at this unix time (milliseconds)
                "notes": "OPTIONAL",
            },
            {
                "username": "sister",
                "password": "Hello World!",
                "updated": 1246456156456
            }
        ],
        "*.roblox.com/*": [
            {
                // notice missing "username" field, which is ok
                "password": "shut up roblox is cool"
            }
        ]
    },
    "secrets": [
        {
            "Social Security Number": {
                "value": "0123456789",
                "notes": "Last updated 2018"
            },
            "Girlfriend Gift Ideas": {
                "value": "- Flowers\n- Beer"
            }
        }
    ],
    "sites-nicknames": {
        "www.google.ca": "Google" // key matches an entry in a password's "sites", including any wildcards
    }
}
```