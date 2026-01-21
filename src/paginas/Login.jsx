import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, salvarSessao } from "../servicos/authServico";
import "./estilos/Login.css";

export default function Login() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(e) {
    e.preventDefault();

    if (!usuario.trim() || !senha.trim()) {
      alert("Informe usuário e senha");
      return;
    }

    try {
      setCarregando(true);

      const dados = await login(usuario.trim(), senha.trim());

      if (!dados) {
        alert("Usuário ou senha inválidos");
        return;
      }

      salvarSessao(dados);

      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Erro ao fazer login");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="login">
      <div className="login-card">
        {/* ✅ LOGO */}
        <div className="login-logo">
  <img src="/logo+nome.png" alt="OdontoGestão" />
</div>

        <p className="subtitulo">Acesse o painel do consultório</p>

        <form onSubmit={entrar} className="login-form">
          <div className="campo">
            <label>Usuário</label>
            <input
              type="text"
              value={usuario}
              onChange={e => setUsuario(e.target.value)}
              placeholder="Digite seu usuário"
              autoFocus
            />
          </div>

          <div className="campo">
            <label>Senha</label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="Digite sua senha"
            />
          </div>

          <button className="btn-entrar" type="submit" disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
