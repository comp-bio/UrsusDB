import React from "react";

const TableImages = (items, root) => {
    return (
        <div className={'table-images'}>
            {(items).map((i, k) => {
                if (!i) return '-';
                let url = (prefix) => (i.slice(0, 5) === 'data:' ? i : `${basename}api/utils/${prefix}/${i}`);
                let style = {backgroundImage: `url(${url('thumb')})`};
                return (
                    <div onClick={() => {
                        root.open({'src': url('main')}, 'lightbox');
                    }} key={k} className={'img'} style={style}> </div>
                )
            })}
        </div>
    );
};

export default TableImages;