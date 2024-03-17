import React from "react";
import ImageUploading from "react-images-uploading";
import Trash from "../svg/Trash.svg";

class ImagesInput extends React.Component {
    constructor(props) {
        super(props);
        this.that = props.that;
        this.state = {images: this.props.items}
        this.onChange = this.onChange.bind(this);
    }

    onChange(imageList) {
        this.props.onChange(imageList.map(k => k.data_url));
        this.setState({images: imageList});
    }

    render() {
        return (
            <ImageUploading
                multiple
                value={this.state.images}
                onChange={this.onChange}
                maxNumber={100}
                dataURLKey="data_url"
            >
                {({
                      imageList,
                      onImageUpload,
                      onImageRemove,
                      isDragging,
                      dragProps,
                  }) => (
                    <div className="upload-image-wrapper">
                        <div className={'current-images'}>
                            {imageList.map((img, index) => {
                                let url = (prefix) => (img['data_url'].slice(0, 5) === 'data:' ? img['data_url'] : `${basename}api/utils/${prefix}/${img['data_url']}`);
                                let style = {backgroundImage: `url(${url('thumb')})`};
                                return (
                                    <div key={index} className="image-item">
                                        <div onClick={() => {
                                            this.that.open({'src': url('main')}, 'lightbox');
                                        }} className="img" style={style} />
                                        <button className={'btn btn-sm btn-danger'} onClick={() => onImageRemove(index)}><Trash /></button>
                                    </div>
                                );
                            })}
                            <button className={'btn image-item add-images'}
                                    style={isDragging ? { color: 'red' } : undefined}
                                    onClick={onImageUpload}
                                    {...dragProps}>Add</button>
                        </div>
                    </div>
                )}
            </ImageUploading>
        );
    }
}

export default ImagesInput;