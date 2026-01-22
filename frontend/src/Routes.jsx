import { HashRouter as Router, Routes, Route} from 'react-router-dom';

import HeaderSite from './site/components/HeaderSite';
import FooterSite from './site/components/FooterSite';
import Home from './site/pages/Home';
import MaisSobreNos from './site/pages/MaisSobreNos';
import Embaixadores from './site/pages/Embaixadores';
import AmigosMelvin from './site/pages/AmigosMelvin';
import CadastroAmigo from './site/pages/CadastroAmigo';
import SerEmbaixador from './site/pages/SerEmbaixador';
import Doacao from './site/pages/Doacao';
import NotaValor from './site/pages/NotaValor';

import Login from "./pages/Login";
import HomeApp from "./pages/HomeApp";
import PrivateRoute from "./services/PrivateRoute";
import Header from "./components/Header";
import Config from "./pages/Config";
import Relatorios from './pages/Relatorios';
import Rendimento from './pages/Rendimento';

// --- COMPONENTES DE LISTAGEM UNIFICADOS ---
// Estes componentes agora controlam tanto a lista de Ativos quanto a de Desativados via prop
import Alunos from "./pages/lista/Alunos"; 
import Voluntarios from "./pages/lista/Voluntarios"; 
import EmbaixadoresApp from './pages/lista/EmbaixadoresApp';
import AmigosMelvinApp from './pages/lista/AmigosMelvinApp';
import Avisos from './pages/lista/Avisos';
import Cestas from './pages/lista/Cestas';

// --- FORMULÁRIOS ---
import AlunoForms from "./pages/forms/Aluno_forms";
import VoluntarioForms from "./pages/forms/Voluntario_forms"; 
import EmbaixadorForms from './pages/forms/Embaixador_forms';
import AmigoMelvinForms from './pages/forms/AmigoMelvin_forms';
import AvisoForms from './pages/forms/Aviso_forms';
import CestasForms from './pages/forms/Cestas_forms';

// --- FREQUÊNCIAS ---
import Aluno_frequencia from "./pages/frequencias/Aluno_frequencia";
import Voluntario_frequencia from "./pages/frequencias/Voluntario_frequencia";


function AppRoutes() {
    return (
        <Router>
            <MainLayout />
        </Router>
    );
}

function MainLayout() {
    return (
        <>
            <Routes>
                <Route path="/*"     element={ <SiteContent/> } />
                <Route path="/login" element={ <Login/> } />
                <Route path="/app/*" element={ <AppContent/> } />
            </Routes>
        </>
    );
}

function SiteContent(){
    return(
        <>
            <HeaderSite/>
            <Routes>
                <Route path="/" element={ <Home/> }/>
                <Route path="/maissobrenos" element={ <MaisSobreNos/> } />
                <Route path="/embaixadores" element={ <Embaixadores/> } />
                <Route path="/amigosmelvin" element={ <AmigosMelvin/> } />
                <Route path="/cadastroamigo" element={ <CadastroAmigo/> } />
                <Route path="/serembaixador" element={ <SerEmbaixador/> }/>
                <Route path="/doacoes" element={ <Doacao/> }/>
                <Route path="/notatemvalor" element={ <NotaValor/> }/>
            </Routes>
            <FooterSite/>
        </>
    )
}

function AppContent() {
    return (
        <>
            <Header/>
            <div className="main-wrapper">
                <Routes>
                    {/* --- HOME DASHBOARD (Por Função) --- */}
                    <Route path="/coor" element={<PrivateRoute element={HomeApp} role="COOR" />} />
                    <Route path="/prof" element={<PrivateRoute element={HomeApp} role="PROF" />} />
                    <Route path="/aux" element={<PrivateRoute element={HomeApp} role="AUX" />} />
                    <Route path="/cozi" element={<PrivateRoute element={HomeApp} role="COZI" />} />
                    <Route path="/dire" element={<PrivateRoute element={HomeApp} role="DIRE" />} />
                    <Route path="/adm" element={<PrivateRoute element={HomeApp} role="ADM" />} />
                    <Route path="/mark" element={<PrivateRoute element={HomeApp} role="MARK" />} />
                    <Route path="/zela" element={<PrivateRoute element={HomeApp} role="ZELA" />} />
                    <Route path="/psico" element={<PrivateRoute element={HomeApp} role="PSICO" />} />
                    <Route path="/assist" element={<PrivateRoute element={HomeApp} role="ASSIST" />} />

                    {/* --- ALUNOS --- */}
                    <Route path="/alunos" element={ <Alunos/> } />
                    <Route path="/aluno/criar" element={<AlunoForms />} />
                    <Route path="/aluno/editar/:matricula" element={<AlunoForms/>} />

                    {/* --- VOLUNTÁRIOS --- */}
                    <Route path="/voluntarios" element={ <Voluntarios/> } />
                    <Route path="/voluntario/criar" element={ <VoluntarioForms/> } />
                    <Route path="/voluntario/editar/:matricula" element={ <VoluntarioForms/> } />
                    
                    {/* --- EMBAIXADORES --- */}
                    <Route path="/embaixadores" element={ <EmbaixadoresApp/> }/>
                    <Route path="/embaixador/editar/:id" element={<EmbaixadorForms/>} />

                    {/* --- AMIGOS DO MELVIN --- */}
                    <Route path="/amigosmelvin" element={ <AmigosMelvinApp/> }/>
                    <Route path="/amigomelvin/editar/:id" element={<AmigoMelvinForms/>} />

                    {/* --- AVISOS --- */}
                    <Route path="/avisos" element={<Avisos/>}/>
                    <Route path="/avisos/criar" element={<AvisoForms/>}/>
                    <Route path="/avisos/editar/:id" element={<AvisoForms/>}/>

                    {/* --- CESTAS --- */}
                    <Route path="/cestas" element={<Cestas/>}/>
                    <Route path="/cestas/criar" element={<CestasForms/>}/>
                    <Route path="/cestas/editar/:id" element={<CestasForms/>}/>

                    {/* --- OUTROS --- */}
                    <Route path="/rendimento_aluno/:matricula" element={<Rendimento/>} />
                    <Route path="/relatorios" element={ <Relatorios/> } />
                    <Route path="/config" element={<Config />} />
                    
                    {/* --- FREQUÊNCIAS --- */}
                    <Route path="/frequencias/alunos" element={<Aluno_frequencia />} />
                    <Route path="/voluntario/frequencias/coordenadores" element={<Voluntario_frequencia tipo="coordenador"/>} />
                    <Route path="/voluntario/frequencias/professores" element={<Voluntario_frequencia tipo="professor"/>} />
                    <Route path="/voluntario/frequencias/auxiliares" element={<Voluntario_frequencia tipo="auxiliar"/>} />
                    <Route path="/voluntario/frequencias/cozinheiros" element={<Voluntario_frequencia tipo="cozinheiro"/>} />
                    <Route path="/voluntario/frequencias/diretores" element={<Voluntario_frequencia tipo="diretor"/>} />
                    <Route path="/voluntario/frequencias/administradores" element={<Voluntario_frequencia tipo="administrador"/>} />
                    <Route path="/voluntario/frequencias/marketing" element={<Voluntario_frequencia tipo="marketing"/>} />
                    <Route path="/voluntario/frequencias/zeladores" element={<Voluntario_frequencia tipo="zelador"/>} />
                    <Route path="/voluntario/frequencias/psicologos" element={<Voluntario_frequencia tipo="psicologo"/>} />
                    <Route path="/voluntario/frequencias/assistentes" element={<Voluntario_frequencia tipo="assistente"/>} />

                    {/* --- ROTAS DE CONFIGURAÇÃO (ARQUIVO MORTO / DESATIVADOS) --- */}
                    {/* Usando os componentes unificados com a prop ativada */}
                    
                    <Route path="/config/matriculasdesativadas/alunos" element={<Alunos modoDesativados={true} />} />
                    
                    <Route path="/config/matriculasdesativadas/voluntarios" element={<Voluntarios modoDesativados={true} />} />
                    
                    <Route path="/config/embaixadoresdesativados" element={<EmbaixadoresApp modoDesativados={true} />} />
                    
                    <Route path="/config/amigosmelvindesativados" element={<AmigosMelvinApp modoDesativados={true} />} />
                    
                    <Route path="/config/avisosdesativados" element={<Avisos modoDesativados={true} />} />
                    
                </Routes>
            </div>
        </>
    );
}

export default AppRoutes;