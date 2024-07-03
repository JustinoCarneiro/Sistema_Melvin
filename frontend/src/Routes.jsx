import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Login from "./pages/Login";
import Coor from "./pages/Coor";
import Prof from "./pages/Prof";
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

function AppRoutes(){
    return(
        <Router>
            <MainLayout />
        </Router>
    )
}

function MainLayout() {
    const location = useLocation();
    const isLoginRoute = location.pathname === "/";

    return (
        <>
            {!isLoginRoute && <Header />}
            <div className="main-wrapper">
                <Routes>            
                    <Route path="/" element={ <Login/> }></Route>
                    <Route path="/coor" element={<PrivateRoute element={Coor} role="COOR" />} />
                    <Route path="/prof" element={<PrivateRoute element={Prof} role="PROF" />} />
                    <Route path="/aux" element={<PrivateRoute element={Prof} role="AUX" />} />
                    <Route path="/cozi" element={<PrivateRoute element={Prof} role="COZI" />} />
                    <Route path="/dire" element={<PrivateRoute element={Prof} role="DIRE" />} />
                    <Route path="/adm" element={<PrivateRoute element={Prof} role="ADM" />} />
                    <Route path="/mark" element={<PrivateRoute element={Prof} role="MARK" />} />
                    <Route path="/zela" element={<PrivateRoute element={Prof} role="ZELA" />} />
                    <Route path="/registro" element={ <Registro/> } />

                    <Route path="/alunos" element={ <Alunos/> } />
                    <Route path="/voluntario/coordenadores" element={ <Voluntarios tipo="coordenador"/> } />
                    <Route path="/voluntario/professores" element={ <Voluntarios tipo="professor"/> } />
                    <Route path="/voluntario/auxiliares" element={ <Voluntarios tipo="auxiliar"/> } />
                    <Route path="/voluntario/cozinheiros" element={ <Voluntarios tipo="cozinheiro"/> } />
                    <Route path="/voluntario/diretoria" element={ <Voluntarios tipo="diretor"/> } />
                    <Route path="/voluntario/cooristracao" element={ <Voluntarios tipo="cooristrador"/> } />
                    <Route path="/voluntario/marketing" element={ <Voluntarios tipo="marketing"/> } />
                    <Route path="/voluntario/zeladoria" element={ <Voluntarios tipo="zelador"/> } />

                    <Route path="/aluno/criar" element={<AlunoForms />} />
                    <Route path="/voluntario/criar/coordenador" element={<VoluntarioForms tipo="coordenador"/>} />
                    <Route path="/voluntario/criar/professor" element={<VoluntarioForms tipo="professor"/>} />
                    <Route path="/voluntario/criar/auxiliar" element={<VoluntarioForms tipo="auxiliar"/>} />
                    <Route path="/voluntario/criar/cozinheiro" element={<VoluntarioForms tipo="cozinheiro"/>} />
                    <Route path="/voluntario/criar/diretor" element={ <VoluntarioForms tipo="diretor"/> } />
                    <Route path="/voluntario/criar/cooristrador" element={ <VoluntarioForms tipo="cooristrador"/> } />
                    <Route path="/voluntario/criar/marketing" element={ <VoluntarioForms tipo="marketing"/> } />
                    <Route path="/voluntario/criar/zelador" element={ <VoluntarioForms tipo="zelador"/> } />

                    <Route path="/aluno/editar/:matricula" element={<AlunoForms />} />
                    <Route path="/voluntario/coordenador/editar/:matricula" element={<VoluntarioForms tipo="coordenador"/>} />
                    <Route path="/voluntario/professor/editar/:matricula" element={<VoluntarioForms tipo="professor"/>} />
                    <Route path="/voluntario/auxiliar/editar/:matricula" element={<VoluntarioForms tipo="auxiliar"/>} />
                    <Route path="/voluntario/cozinheiro/editar/:matricula" element={<VoluntarioForms tipo="cozinheiro"/>} />
                    <Route path="/voluntario/diretor/editar/:matricula" element={<VoluntarioForms tipo="diretor"/>} />
                    <Route path="/voluntario/cooristrador/editar/:matricula" element={<VoluntarioForms tipo="cooristrador"/>} />
                    <Route path="/voluntario/marketing/editar/:matricula" element={<VoluntarioForms tipo="marketing"/>} />
                    <Route path="/voluntario/zelador/editar/:matricula" element={<VoluntarioForms tipo="zelador"/>} />
                    
                    <Route path="/frequencias/alunos" element={<Aluno_frequencia />} />
                    <Route path="/voluntario/frequencias/coordenadores" element={<Voluntario_frequencia tipo="coordenador"/>} />
                    <Route path="/voluntario/frequencias/professores" element={<Voluntario_frequencia tipo="professor"/>} />
                    <Route path="/voluntario/frequencias/auxiliares" element={<Voluntario_frequencia tipo="auxiliar"/>} />
                    <Route path="/voluntario/frequencias/cozinheiros" element={<Voluntario_frequencia tipo="cozinheiro"/>} />
                    <Route path="/voluntario/frequencias/diretores" element={<Voluntario_frequencia tipo="diretor"/>} />
                    <Route path="/voluntario/frequencias/cooristradores" element={<Voluntario_frequencia tipo="cooristrador"/>} />
                    <Route path="/voluntario/frequencias/marketing" element={<Voluntario_frequencia tipo="marketing"/>} />
                    <Route path="/voluntario/frequencias/zeladores" element={<Voluntario_frequencia tipo="zelador"/>} />

                    <Route path="/config" element={<Config />} />
                    <Route path="/config/matriculasdesativadas/alunos" element={<AlunosDesativados/>} />
                    <Route path="/config/matriculasdesativadas/voluntarios" element={<VoluntariosDesativados/>} />
                </Routes>
            </div>
        </>
    );
}

export default AppRoutes;