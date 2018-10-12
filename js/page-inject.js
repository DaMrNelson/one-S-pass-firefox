// Get inputs
// Returns [usernameInput, newPasswordInput] (each index being a jQuery object)
// Any number of these may be null (ie undefined), but there will always be three returned
function getFormInputs($form) {
    var $inputs = $form.find("input:visible");
    var $passwords = $inputs.filter("[type=password]");

    // Can't find username if there is no password
    if ($passwords.length === 0 || $passwords.length > 3) {
        return [null, null];
    }

    // Get username field (probably before first password)
    var $username = $inputs.filter("[name=username]");

    if ($username.length !== 1) {
        $username = null;
        var passIndex;
        $inputs.each(function(i) {
            if ($(this)[0] === $passwords[0]) {
                passIndex = i;
                return false;
            }
        });

        if (passIndex > 0) {
            for (var i = passIndex - 1; i >= 0; i--) {
                if ($inputs.get(i).type === "text") {
                    $username = $($inputs.get(i));
                    break;
                }
            }
        }
    }

    // Return results
    if ($passwords.length === 1) { // Probably a login
        return [$username, $($passwords.get(0))];
    } else if ($passwords.length === 2) { // Probably assigning password
        return [$username, $($passwords.get(1))];
    } else { // $passwords.length === 3 // Probably assigning a new password with a check for their old password
        return [$username, $($passwords.get(2))];
    }
}

// Listen for messages
// TODO: Fill on message from server
// TODO: Record form submissions?

// TODO: Remove; testing
$(document).ready(function() {
    $("form").each(function() {
        console.log(getFormInputs($(this)));
    });
});
