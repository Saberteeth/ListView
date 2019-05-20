import React, { Component } from 'react';
import 'antd/dist/antd.css';
import { render } from 'react-dom'
import ListView from '../../src';
import { Slider, message } from 'antd';
import iconSVG from './icon.svg'
const { List, Adapter } = ListView;

class Demo extends Component {
  constructor(props) {
    super(props);
    const that = this;
    this.resize();
    class MyAdapter extends Adapter {
      getDataArr() {
        return that.arr;
      }

      getItem(data, index) {
        const size = this.getItemHeight(index) - 20;
        return <div style={{ fontSize: `${size == 60 ? 30 : 12}px`, padding: '10px'  }} onClick={()=>{ message.info(`${index} 被点击了。`) }} ><img height={size} src={iconSVG} style={{ marginRight: '10px' }} />{data}</div>;
      }

      getItemHeight(i) {
        return i%2 == 0 ? 50: 80;
      }

      onScroll(e) {
        that.setState({ input: e })
      }
    }
    this.adapter = new MyAdapter();
  }

  resize() {
    let scale = 0;
    if (this.adapter) {
      scale = this.state.input / this.adapter.size;
    }

    this.arr = [];
    for (let i = 0; i < this.state.size; i += 1) {
      this.arr.push(i);
    }

    if (scale) {
      this.onCeckItem(Math.floor(scale * this.state.size))
    }
    this.adapter && this.adapter.updateList();
  }

  onChange(e) {
    this.setState({ date: e })
  }

  componentDidMount() {
    this.onClick();
  }

  state = {
    value: '请输入内容',
    input: 0,
    size: 100,
    isBadModel: false,
  }

  onClick(index) {
    this.adapter.checkItem(index);
  }

  onCeckItem(e) {
    this.onClick(e); this.setState({ input: e })
  }

  changeBadModel() {
    this.setState({ isBadModel: !this.state.isBadModel })
  }

  renderBadModel() {
    return <ul className="list" style={{ height: '200px', overflowY: 'scroll' }}>
      {this.adapter.getDataArr().map(e => {
        return (<li style={{ height: '50px', padding: '10px' }} key={e}><img height={30} style={{ paddingRight: '10px' }} src={iconSVG} />{e}</li>)
      })}
    </ul>
  }

  render() {
    const style = {
      width: 400,
    };
    return <div>
      <div style={{ padding: '20px' }}>
        <div style={{ paddingBottom: '10px' }}><input value={this.state.size} type='number' onChange={e => {
          if (e.target.value * 1 > 0) this.setState({ size: e.target.value * 1 })
        }} />
          <button onClick={this.resize.bind(this)}>改变长度</button>
          <button onClick={this.changeBadModel.bind(this)}>改版浏览模式</button>
        </div>
        {this.state.isBadModel ? this.renderBadModel() : (<div style={{ height: '400px', width: '400px', marginTop: '8px' }}>
          <List adapter={this.adapter} />
        </div>)}
        <div style={style}>
          <Slider value={this.state.input} defaultValue={0} max={this.adapter.maxStart} onChange={this.onCeckItem.bind(this)} />
        </div>
      </div>
    </div>
  }
}

render(<Demo />, document.querySelector('#demo'))
