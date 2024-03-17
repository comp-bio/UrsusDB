import React from "react";
import {
    BrowserRouter,
    NavLink,
    Route,
    Routes,
    matchPath,
    useLocation,
} from 'react-router-dom'
import { Tab, Tabs } from "@mui/material";

import SamplesPage from "./SamplesPage";
import ColumnsPage from "./ColumnsPage";

import Modals from "../components/Modals";

function useRouteMatch(patterns) {
    const { pathname } = useLocation();
    for (let i = 0; i < patterns.length; i += 1) {
        const pattern = patterns[i];
        const possibleMatch = matchPath(pattern, pathname);
        if (possibleMatch !== null) {
            return possibleMatch;
        }
    }
    return null;
}

function Navigation() {
    const routeMatch = useRouteMatch(['/samples', '/columns']);
    const currentTab = routeMatch?.pattern?.path;
    return (
        <Tabs value={currentTab}>
            <Tab label="Overview" value="/" component="a" href={"/"} />
            <Tab label="Samples" value="/samples" component={NavLink} to={'/samples'} />
            <Tab label="Columns" value="/columns" component={NavLink} to={'/columns'} />
        </Tabs>
    );
}

class Admin extends Modals {
    constructor(props) {
        super(props);
        this.state['tab'] = ['/samples', '/columns'].indexOf(location.pathname);
    }

    render() {
        return this.modalsWrapper(
            <BrowserRouter>
                <div className={'application'}>
                    <nav className={'nav-panel'}>
                        <Navigation />
                    </nav>
                    <div className={'app-content'}>
                        <Routes>
                            <Route path="/samples" element={<SamplesPage that={this} />} />
                            <Route path="/columns" element={<ColumnsPage that={this} />} />
                        </Routes>
                    </div>
                </div>
            </BrowserRouter>
        );
    }
}

export default Admin;
