function extractUsernameEmailPassword(request) {
    const { username, email, password } = request.body;
    return { username, email, password };
}
export { extractUsernameEmailPassword };
