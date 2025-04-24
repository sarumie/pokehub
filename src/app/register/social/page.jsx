export default function SocialRegisterPage() {
  return (
    <div className="container">
      <div className="left">
        <img src="assets/logo.png" width="150" />
        <h1>
          Poke<span>Hub</span>
        </h1>
        <p>Join us to the world of Pokemons</p>
      </div>
      <div className="right">
        <h2>Login with social media</h2>
        <div className="form-input">
          <button type="submit">Google</button>
        </div>
        <div className="form-input">
          <button type="submit">Apple</button>
        </div>
        <div className="form-input">
          <button type="submit">Twitter</button>
        </div>
      </div>
    </div>
  );
}
