import React, { Component } from 'react';
import 'antd/dist/antd.css';
import { render } from 'react-dom'
import Operator from './operator';
import ListView from '../../src';
import { Slider, message, Table } from 'antd';
import iconSVG from './icon.svg'
import './index.less'
const { List, Adapter } = ListView;
const { by, operator, operators } = Operator;
const { debounceTime } = operators;

class Demo extends Component {
  constructor(props) {
    super(props);
    const that = this;
    this.resize();
    class MyAdapter extends by(Adapter) {
      getDataArr() {
        return that.arr;
      }

      @operator(debounceTime(500)) // 消除疯狂点击
      onClickItem(index) {
        message.info(`${index} 被点击了。`);
      }

      getItem(data, index) {
        const size = this.getItemHeight(index) - 20;
        return <div style={{ fontSize: `${size == 60 ? 30 : 12}px`, padding: '10px'  }} onClick={()=>{ this.onClickItem(index) }} ><img height={size} src={iconSVG} style={{ marginRight: '10px' }} />{data}</div>;
      }

      getItemHeight() {
        return 80;
      }

      onScroll(e) {
        that.setState({ input: e })
      }
    }
    this.adapter = new MyAdapter();
  }

  resize() {
    this.arr = [];
    for (let i = 0; i < this.state.size; i += 1) {
      this.arr.push(i);
    }
   
    this.adapter && this.adapter.updateList();
  }

  onChange(e) {
    this.setState({ date: e })
  }

  state = {
    value: '请输入内容',
    input: 0,
    size: 300,
    isBadModel: false,
    data: [
      {
        key: '1',
        name: 'John Brown',
        age: 32,
        address: 'New York No. 1 Lake Park',
      },
      {
        key: '2',
        name: 'Jim Green',
        age: 42,
        address: 'London No. 1 Lake Park',
      },
      {
        key: '3',
        name: 'Joe Black',
        age: 32,
        address: 'Sidney No. 1 Lake Park',
      },
      {
        key: '4',
        name: 'Jim Red',
        age: 32,
        address: 'London No. 2 Lake Park',
      },
    ]
  }

  // onClick(index) {
  //   this.adapter.checkItem(index);
  // }

  // onCeckItem(e) {
  //   this.onClick(e); this.setState({ input: e })
  // }

  changeBadModel() {
    this.setState({ isBadModel: !this.state.isBadModel })
  }

  renderBadModel() {
    return <ul className="list" style={{ height: '400px', width: '400px', overflowY: 'scroll', float: 'left' }}>
      {this.adapter.getDataArr().map(e => {
        return (<li style={{ height: '80px', padding: '10px' }} key={e}><img height={60} style={{ paddingRight: '10px' }} src={iconSVG} />{e}</li>)
      })}
    </ul>
  }

  render() {
    console.log(this.state);
    const style = {
      width: 400,
    };
    const columns = [
      {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: 'Age',
        dataIndex: 'age',
        key: 'age',
        sorter: (a, b) => a.age - b.age,
      },
      {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
      },
    ];
    return <div>
      <div style={{ padding: '20px' }}>
        <div style={{ paddingBottom: '10px' }}><input value={this.state.size} type='number' onChange={e => {
          let value = e.target.value * 1;
          value < 0 && (value = 0);
          value > 200000 && (value = 200000);
          this.setState({ size: value });
        }} />
          <button onClick={this.resize.bind(this)}>改变长度</button>
          <button onClick={this.changeBadModel.bind(this)}>改版浏览模式</button>
        </div>
        {this.state.isBadModel ? this.renderBadModel() : (<div style={{ height: '400px', width: '400px', marginTop: '8px' }}>
          <List adapter={this.adapter} />
        </div>)}
      </div>
      {/* <Table columns={columns} dataSource={this.state.data} onChange={this.handleChange} /> */}
    </div>
  }
}

render(<Demo />, document.querySelector('#demo'))
