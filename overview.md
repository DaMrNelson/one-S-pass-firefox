TODO: Rethink a lot of this. Can popup talk to background? When do popup scripts get run? Do they know what tab they are on?

# Legend
- [BACKGROUND]: A background script
- [CONTENT]: A content script
- [POPUP]: A popup and any resources belonging to it

# Popup
Just shows login prompt, a link to the main manager, and says if passwords are available for the given page.

# Process: Login
1. [POPUP] Ask [BACKGROUND] to login
2. [BACKGROUND] Validates credentials
3. [BACKGROUND] Tells [POPUP] that credentials are valid
4. [POPUP] Shows "loading" animation
5. [BACKGROUND] Pulls the store, decrypts it
6. [BACKGROUND] Stores "logged in fully" state
7. [POPUP] Notices that "logged in fully" state is now good, shows logged default stuff

# Process: User Visits Page
1. [CONTENT] Check to see if there is any username and password inputs (exit if not)
2. [CONTENT] Ask [BACKGROUND] for passwords for this domain
3. [BACKGROUND] Sets browserAction.setBadgeText to the number of passwords
4. [BACKGROUND] Returns password
5. [CONTENT] Updates dropdown menus? Or just leave it to popup?

# Process: User Clicks Password in Popup
1. [POPUP] Checks to see if there is any username and password inputs
    - If yes, fills them
    - If no, prompt to user to select the username and password fields
