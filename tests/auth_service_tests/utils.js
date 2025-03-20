
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
}

function generateRandomEmail(length) {
    return generateRandomString(length).toLowerCase() + '@' + generateRandomString(length).toLowerCase() + ".com";
}

async function createUser(base_url, requestBody){
    await fetch(base_url + '/user', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then((res) => {
            if (res.status === 201) {
                return res.json()
            }
        })
    .catch((err) => {
        console.log(err);
    })
}

export { generateRandomString, generateRandomEmail, createUser };