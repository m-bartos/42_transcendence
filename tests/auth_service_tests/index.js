console.log("Auth Service Test");

let success = 0;
let failure = 0;
let ii = 0;
for (let i = 0; i < 100; i++)
{
    await fetch("http://localhost/api/auth/user", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({username: "test" + Math.random(), password: "password", email: "test@example.com"+ Math.random()}),
    })
        .then((response) => {
            if (response.status === 201)
                success++;
            else
                failure++;
        return response.json();
    })
        .then((data) => {
            console.log(data);
        })
    .catch((error) => {
        console.error(error);
    })
    ii = i;
}

console.log(`Create user attempted ${ii + 1} times, successful requests ${success}, and ${failure} failures.`);
