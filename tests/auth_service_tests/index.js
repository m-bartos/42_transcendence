console.log("Auth Service Test");

const result = await fetch("http://localhost/api/auth/user");
if (result.ok)
{
    console.log(result);
}