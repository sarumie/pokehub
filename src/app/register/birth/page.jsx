export default function BirthRegisterPage() {
  return (
    <div className="container">
      <div className="left">
        <img
          src="https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/i/8a5d5bc8-94fe-46e1-ac40-03969b602a62/dg4mjze-33edda11-2e31-4a6b-8fb7-a4607735d063.png"
          width="150"
        />
        <h1>
          Poke<span>Hub</span>
        </h1>
        <p>Join us to the world of Pokemons</p>
      </div>
      <div className="right">
        <h2>Confirm birth</h2>
        <div className="form-input birth-inputs">
          <input type="text" placeholder="Date" />
          <input type="text" placeholder="Month" />
          <input type="text" placeholder="Year" />
        </div>
        <button className="form-button-main">Confirm my birth</button>
      </div>
    </div>
  );
}
