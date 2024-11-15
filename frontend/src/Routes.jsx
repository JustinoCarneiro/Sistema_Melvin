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
import Registro from "./pages/Registro";
import PrivateRoute from "./services/PrivateRoute";
import Alunos from "./pages/lista/Alunos";
import Voluntarios from "./pages/lista/Voluntarios";
import AlunoForms from "./pages/forms/Aluno_forms";
import VoluntarioForms from "./pages/forms/Voluntario_forms";
import Aluno_frequencia from "./pages/frequencias/Aluno_frequencia";
import Voluntario_frequencia from "./pages/frequencias/Voluntario_frequencia";
import Config from "./pages/Config";
import Header from "./components/Header";
import AlunosDesativados from "./pages/lista_matriculas_desativadas/AlunosDesativados";
import VoluntariosDesativados from "./pages/lista_matriculas_desativadas/VoluntariosDesativados";
import EmbaixadorForms from './pages/forms/Embaixador_forms';
import EmbaixadoresApp from './pages/lista/EmbaixadoresApp';
import EmbabaixadoresDesativados from './pages/lista_matriculas_desativadas/EmbaixadoresDesativados';
import AmigoMelvinForms from './pages/forms/AmigoMelvin_forms';
import AmigosMelvinApp from './pages/lista/AmigosMelvinApp';
import AmigosMelvinDesativados from './pages/lista_matriculas_desativadas/AmigosMelvinDesativados';
import Avisos from './pages/lista/Avisos';
import AvisoForms from './pages/forms/Aviso_forms';
import AvisosDesativados from './pages/lista_matriculas_desativadas/AvisosDesativados';
import Cestas from './pages/lista/Cestas';
import CestasForms from './pages/forms/Cestas_forms';
import AlunosExtra from './pages/lista/AlunosExtra';

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
                    <Route path="/coor" element={<PrivateRoute element={HomeApp} role="COOR" />} />
                    <Route path="/prof" element={<PrivateRoute element={HomeApp} role="PROF" />} />
                    <Route path="/aux" element={<PrivateRoute element={HomeApp} role="AUX" />} />
                    <Route path="/cozi" element={<PrivateRoute element={HomeApp} role="COZI" />} />
                    <Route path="/dire" element={<PrivateRoute element={HomeApp} role="DIRE" />} />
                    <Route path="/adm" element={<PrivateRoute element={HomeApp} role="ADM" />} />
                    <Route path="/mark" element={<PrivateRoute element={HomeApp} role="MARK" />} />
                    <Route path="/zela" element={<PrivateRoute element={HomeApp} role="ZELA" />} />
                    <Route path="/registro" element={ <Registro/> } />

                    <Route path="/alunos" element={ <Alunos/> } />
                    <Route path="/alunos/extra" element={ <AlunosExtra/> } />
                    <Route path="/voluntario/coordenadores" element={ <Voluntarios tipo="coordenador"/> } />
                    <Route path="/voluntario/professores" element={ <Voluntarios tipo="professor"/> } />
                    <Route path="/voluntario/auxiliares" element={ <Voluntarios tipo="auxiliar"/> } />
                    <Route path="/voluntario/cozinheiros" element={ <Voluntarios tipo="cozinheiro"/> } />
                    <Route path="/voluntario/diretoria" element={ <Voluntarios tipo="diretor"/> } />
                    <Route path="/voluntario/administracao" element={ <Voluntarios tipo="administrador"/> } />
                    <Route path="/voluntario/marketing" element={ <Voluntarios tipo="marketing"/> } />
                    <Route path="/voluntario/zeladoria" element={ <Voluntarios tipo="zelador"/> } />
                    <Route path="/embaixadores" element={ <EmbaixadoresApp/> }/>
                    <Route path="/amigosmelvin" element={ <AmigosMelvinApp/> }/>
                    <Route path="/avisos" element={<Avisos/>}/>
                    <Route path="/cestas" element={<Cestas/>}/>

                    <Route path="/aluno/criar" element={<AlunoForms />} />
                    <Route path="/voluntario/criar/coordenador" element={<VoluntarioForms tipo="coordenador"/>} />
                    <Route path="/voluntario/criar/professor" element={<VoluntarioForms tipo="professor"/>} />
                    <Route path="/voluntario/criar/auxiliar" element={<VoluntarioForms tipo="auxiliar"/>} />
                    <Route path="/voluntario/criar/cozinheiro" element={<VoluntarioForms tipo="cozinheiro"/>} />
                    <Route path="/voluntario/criar/diretor" element={ <VoluntarioForms tipo="diretor"/> } />
                    <Route path="/voluntario/criar/administrador" element={ <VoluntarioForms tipo="administrador"/> } />
                    <Route path="/voluntario/criar/marketing" element={ <VoluntarioForms tipo="marketing"/> } />
                    <Route path="/voluntario/criar/zelador" element={ <VoluntarioForms tipo="zelador"/> } />
                    <Route path="/avisos/criar" element={<AvisoForms/>}/>
                    <Route path="/cestas/criar" element={<CestasForms/>}/>

                    <Route path="/amigomelvin/editar/:id" element={<AmigoMelvinForms/>} />
                    <Route path="/embaixador/editar/:id" element={<EmbaixadorForms/>} />
                    <Route path="/aluno/editar/:matricula" element={<AlunoForms />} />
                    <Route path="/voluntario/coordenador/editar/:matricula" element={<VoluntarioForms tipo="coordenador"/>} />
                    <Route path="/voluntario/professor/editar/:matricula" element={<VoluntarioForms tipo="professor"/>} />
                    <Route path="/voluntario/auxiliar/editar/:matricula" element={<VoluntarioForms tipo="auxiliar"/>} />
                    <Route path="/voluntario/cozinheiro/editar/:matricula" element={<VoluntarioForms tipo="cozinheiro"/>} />
                    <Route path="/voluntario/diretor/editar/:matricula" element={<VoluntarioForms tipo="diretor"/>} />
                    <Route path="/voluntario/administrador/editar/:matricula" element={<VoluntarioForms tipo="administrador"/>} />
                    <Route path="/voluntario/marketing/editar/:matricula" element={<VoluntarioForms tipo="marketing"/>} />
                    <Route path="/voluntario/zelador/editar/:matricula" element={<VoluntarioForms tipo="zelador"/>} />
                    <Route path="/avisos/editar/:id" element={<AvisoForms/>}/>
                    <Route path="/cestas/editar/:id" element={<CestasForms/>}/>
                    
                    <Route path="/frequencias/alunos" element={<Aluno_frequencia />} />
                    <Route path="/voluntario/frequencias/coordenadores" element={<Voluntario_frequencia tipo="coordenador"/>} />
                    <Route path="/voluntario/frequencias/professores" element={<Voluntario_frequencia tipo="professor"/>} />
                    <Route path="/voluntario/frequencias/auxiliares" element={<Voluntario_frequencia tipo="auxiliar"/>} />
                    <Route path="/voluntario/frequencias/cozinheiros" element={<Voluntario_frequencia tipo="cozinheiro"/>} />
                    <Route path="/voluntario/frequencias/diretores" element={<Voluntario_frequencia tipo="diretor"/>} />
                    <Route path="/voluntario/frequencias/administradores" element={<Voluntario_frequencia tipo="administrador"/>} />
                    <Route path="/voluntario/frequencias/marketing" element={<Voluntario_frequencia tipo="marketing"/>} />
                    <Route path="/voluntario/frequencias/zeladores" element={<Voluntario_frequencia tipo="zelador"/>} />

                    <Route path="/config" element={<Config />} />
                    <Route path="/config/matriculasdesativadas/alunos" element={<AlunosDesativados/>} />
                    <Route path="/config/matriculasdesativadas/voluntarios" element={<VoluntariosDesativados/>} />
                    <Route path="/config/embaixadoresdesativados" element={ <EmbabaixadoresDesativados/> } />
                    <Route path="/config/amigosmelvindesativados" element={ <AmigosMelvinDesativados/> } />
                    <Route path="/config/avisosdesativados" element={<AvisosDesativados/>}/>
                </Routes>
            </div>
        </>
    );
}

export default AppRoutes;