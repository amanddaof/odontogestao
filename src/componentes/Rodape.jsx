import "./estilos/Rodape.css";

export default function Rodape() {
  const ano = new Date().getFullYear();

  return (
    <footer className="rodape">
      <div className="rodape-container">
        <div className="rodape-linha-topo" />

        <div className="rodape-conteudo">
          {/* ESQUERDA */}
          <div className="rodape-esquerda">
            <span className="rodape-texto">
              Desenvolvido por <strong>Amanda Oliveira</strong>
            </span>

            <span className="rodape-dot" />

            <span className="rodape-badge">v2.2.1</span>

            <span className="rodape-ano">{ano}</span>

            <span className="rodape-dot" />

            <span className="rodape-status">
              <span className="rodape-status-bolinha" />
              Online • Sincronizado
            </span>
          </div>

          {/* DIREITA */}
          <div className="rodape-direita">
            <a className="rodape-pill" href="tel:+5535988241068">
              <span className="rodape-pill-label">Telefone</span>
              <span className="rodape-pill-valor">(35) 98824-1068</span>
            </a>

            <a
              className="rodape-pill rodape-pill-whats"
              href="https://wa.me/5535988241068"
              target="_blank"
              rel="noreferrer"
            >
              <span className="rodape-pill-label">WhatsApp</span>
              <span className="rodape-pill-valor">Atendimento rápido</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
