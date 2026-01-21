import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { inserirPaciente } from "../servicos/pacientesServico";
import "./estilos/PacienteNovo.css";

export default function PacienteNovo() {
  const navigate = useNavigate();

  const [salvando, setSalvando] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    mensalidade: "",
    cpf: "",
    telefone: "",
    endereco: "",
    data_nascimento: ""
  });

  function atualizarCampo(campo, valor) {
    setForm(prev => ({ ...prev, [campo]: valor }));
  }

  async function salvar(e) {
    e.preventDefault();

    if (!form.nome.trim()) {
      alert("Informe o nome do paciente");
      return;
    }

    if (!form.mensalidade) {
      alert("Informe a mensalidade");
      return;
    }

    try {
      setSalvando(true);

      const unidadeId = Number(localStorage.getItem("unidade_id"));

      if (!unidadeId) {
        alert("Selecione uma unidade antes de cadastrar o paciente.");
        return;
      }

      // ✅ pega o profissional logado/selecionado (se não existir, cai no 1)
      const profissionalId = Number(localStorage.getItem("profissional_id")) || 1;

      const dados = {
        nome: form.nome.trim(),
        mensalidade: Number(form.mensalidade || 0),
        cpf: form.cpf.trim() || null,
        telefone: form.telefone.trim() || null,
        endereco: form.endereco.trim() || null,
        data_nascimento: form.data_nascimento || null,
        unidade_id: unidadeId,
        profissional_id: profissionalId
      };

      await inserirPaciente(dados);

      alert("Paciente cadastrado com sucesso!");
      navigate("/pacientes");
    } catch (err) {
      console.error(err);
      alert("Erro ao cadastrar paciente");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="paciente-novo">
      <div className="paciente-novo-topo">
        <div className="paciente-novo-titulo">
          <h1>Novo paciente</h1>
          <span className="paciente-novo-subtitulo">
            Cadastro rápido do paciente • Preencha os dados abaixo
          </span>
        </div>
      </div>

      <form onSubmit={salvar}>
        <div className="form-card">
          <div className="form-grid">
            <div className="campo">
              <label>Nome *</label>
              <input
                type="text"
                value={form.nome}
                onChange={e => atualizarCampo("nome", e.target.value)}
                placeholder="Ex: Ana Costa"
              />
            </div>

            <div className="campo">
              <label>Mensalidade (R$) *</label>
              <input
                type="number"
                step="0.01"
                value={form.mensalidade}
                onChange={e => atualizarCampo("mensalidade", e.target.value)}
                placeholder="Ex: 100"
              />
            </div>

            <div className="campo">
              <label>CPF</label>
              <input
                type="text"
                value={form.cpf}
                onChange={e => atualizarCampo("cpf", e.target.value)}
                placeholder="000.000.000-00"
              />
            </div>

            <div className="campo">
              <label>Telefone</label>
              <input
                type="text"
                value={form.telefone}
                onChange={e => atualizarCampo("telefone", e.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="campo linha-cheia">
              <label>Endereço</label>
              <input
                type="text"
                value={form.endereco}
                onChange={e => atualizarCampo("endereco", e.target.value)}
                placeholder="Rua..."
              />
            </div>

            <div className="campo">
              <label>Data de nascimento</label>
              <input
                type="date"
                value={form.data_nascimento}
                onChange={e => atualizarCampo("data_nascimento", e.target.value)}
              />
            </div>
          </div>

          <div className="form-acoes">
            <button type="submit" className="btn-salvar" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </button>

            <Link to="/pacientes" className="btn-cancelar">
              Cancelar
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
