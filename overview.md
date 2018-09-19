# Urgent Password Change
- The password MUST be hashed ON THE CLIENT. Securely. Never send it EVER. There is no excuses for that.

# Temp: Communication Notes
- It looks like popup can communicate directly with background scripts. I think their scripts have access to sendMessage. I am not 100% sure tho.
- You can communicate with tabs or scripts running on tabs (but should definitely NEVER let the tab's code see your message)
- Some/all [CONTENT] could probably be replaced with [BACKGROUND]. But should it be? What would the benefits/fallbacks be?

# Legend
- [BACKGROUND]: A background script (always running)
- [CONTENT]: A content script (running per-page)
- [POPUP]: A popup script (only running when popup is open)

# Popup
Just shows login prompt, a link to the main manager, and says if passwords are available for the given page.

# Process: Login
1. [POPUP] Ask [BACKGROUND] to login (communicate)
2. [BACKGROUND] Validates credentials
3. [BACKGROUND] Updates storage to note that given value is valid (also include current time or something so it updates) (also set if invalid)
4. [POPUP] Notices storage value changes. Shows "loading" animation (or shows failure)
5. [BACKGROUND] Pulls the store, decrypts it
6. [BACKGROUND] Updates storage to note that we are now fully logged in
7. [POPUP] Notices storage value changes. Shows logged default stuff (or shows failure)

# Process: User Visits Page: Update Passwords List
1. [CONTENT] Check to see if there is any username and password inputs (exit if not)
2. [CONTENT] Tell [BACKGROUND] to check for passwords for this domain
3. [BACKGROUND] Sets browserAction.setBadgeText to the number of passwords (use tab ID)
4. [BACKGROUND] Returns password (yes, this is possible, sendMessage returns a Promise)
5. [CONTENT] If settings say so, auto-fills passwords (or nah, is that insecure?)

# Process: User Opens Popup on a Page
NOTE: This assumes that the user is logged in. See **Process: Login** if they are not.
1. [POPUP] List all accounts for this domain
2. [POPUP] If one is clicked, try to find credentials
3. [POPUP] If credentials are found, fill them in. If not, have them click on the text field and automatically fill it in.

# Process: User Logs In Or Signs Up
1. [CONTENT] Subscribe to form submits for forms with valid login fields
2. [CONTENT] On form submit, send the values to [BACKGROUND]
3. [BACKGROUND] Store the values IN MEMORY, sets a timer to clear them after 60 seconds
4. [CONTENT] Adds content to the page asking the user if they want to save the password, sets a timer to clear it after 60 seconds
5. [CONTENT] If they click yes or no, tell [BACKGROUND]
6. [BACKGROUND] Add to store, or delete and clear timer

# Process: User Visits Page: Persist Save Password Dialog
1. [CONTENT] Ask [BACKGROUND] if there is any "save password" requests for this domain
2. [BACKGROUND] Checks, returns true or false
3. [CONTENT] If there is one, show it, and set a timer to clear it when it expires
4. [CONTENT] If they click yes or no, tell [BACKGROUND]
5. [BACKGROUND] Add to store, or delete and clear timer

# Goals / things to not forget
- Allow them to set password hints
- MFA
- Support Firefox, Chrome, Linux, Windows, OSX, Android, iOS, and windows phone
    - Not sure what you will have to do once you get to mobile. Save to clipboard? Hopefully that is an option.
- See where other password managers fucked up. Then don't do what they did.
- Actually price this stuff out. Inb4 Two Dollar Pass, the Three Dollar Password Manager: One-time Price of Four Dollars!
- Open source the server? Switch to Rust? Or would that just be making it more dangerous?
