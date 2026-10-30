import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import WorkQueue from "./pages/WorkQueue";
function Placeholder() { return <Navigate to="/" replace/>; }
export default function App() {
  return <Routes><Route element={<Layout/>}>
    <Route index element={<Dashboard/>}/>
    <Route path="archive" element={<WorkQueue kind="archive"/>}/>
    <Route path="scanning" element={<WorkQueue kind="scanning"/>}/>
    <Route path="editing" element={<WorkQueue kind="editing"/>}/>
    <Route path="quality-control" element={<WorkQueue kind="quality-control"/>}/>
    <Route path="repository" element={<WorkQueue kind="repository"/>}/>
    <Route path="approval" element={<WorkQueue kind="approval"/>}/>
    <Route path="reports" element={<WorkQueue kind="reports"/>}/>
    <Route path="users" element={<WorkQueue kind="users"/>}/>
    <Route path="*" element={<Placeholder/>}/>
  </Route></Routes>;
}