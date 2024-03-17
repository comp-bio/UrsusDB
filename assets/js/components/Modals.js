import React from "react";
import {Button, Dialog, DialogTitle, IconButton} from "@mui/material";
import {SnackbarProvider, enqueueSnackbar, closeSnackbar} from 'notistack';

import Close from "../svg/Close.svg";

class Modals extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            'modal': {show: false, body: null, title: null, after: null},
            'lightbox': {show: false, src: null},
        };
    }

    open(obj, code, after = null) {
        this.setState({[code]: {'after': after, 'show': true, ...obj}})
    }

    close(code) {
        this.setState({[code]: {show: false}}, this.state[code].after);
    }


    snack(message, after=null, onStop=null) {
        let timer = setTimeout(() => {
            if (after) after();
        }, 5000);
        const action = snackbarId => (
            <Button size={'small'} onClick={() => {
                closeSnackbar(snackbarId);
                clearTimeout(timer);
                if (onStop) onStop();
            }}>Undo</Button>
        );
        enqueueSnackbar(message, { action, })
    }

    modalsWrapper(content) {
        return (
            <SnackbarProvider maxSnack={3} autoHideDuration={5000}>
                {content}
                <Dialog
                    open={this.state.modal.show}
                    onClose={() => this.close('modal')}
                    maxWidth={'xl'}
                    scroll={'paper'}>
                    <DialogTitle>
                        {this.state.modal.title}
                        <IconButton aria-label="close" onClick={() => this.close('modal')}><Close /></IconButton>
                    </DialogTitle>
                    {this.state.modal.body}
                </Dialog>

                <Dialog
                    open={this.state.lightbox.show}
                    onClose={() => this.close('lightbox')}
                    maxWidth={'xl'}
                    scroll={'paper'}>
                    <img className={'image-full'} src={this.state.lightbox.src} />
                </Dialog>
            </SnackbarProvider>
        )
    }
}
export default Modals;
