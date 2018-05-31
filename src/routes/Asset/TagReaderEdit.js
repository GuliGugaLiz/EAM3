import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import Moment from 'moment';
import fetch from 'dva/fetch';
//import jsonp from 'jsonp';
import querystring from 'querystring';
import { Row, Col, Card, Form, Input, Select, Icon,
   Button, Dropdown, Menu, InputNumber, Switch,
    DatePicker, Modal, message, Badge, Divider,List } from 'antd';

import styles from './TagReaderList.less';
const { TextArea } = Input;

const FormItem = Form.Item;
const Option = Select.Option;

let timeout;
let currentValue;

function doFetch(value,callback) {
  console.log(value);
  if(timeout) {
    clearTimeout(timeout);
    timeout = null;
  }
  currentValue = value;
  function getDateList() {
    const str = querystring.encode({
      code:'utf-8',
      q:value
    });
    fetch(`https://suggest.taobao.com/sug?${str}`,{
      method:'POST',
      mode:'no-cors',
      headers : {

        'Content-Type': 'text/html; charset=utf-8',

        'Accept': 'application/json'

       }
    }) 
    .then(response => response.text())
    .then((d) => {
      console.log(d)
      if(currentValue === value){
        const resultTxt = d.result; 
        console.log(resultTxt);
        //const result = eval(resultTxt);
        const siteNameData = [];
        result.forEach((item) => {
          siteNameData.push({
            value:item[0],
            text:item[0]
          }); 
        });
        callback(siteNameData);
      }
    });
  }
  timeout = setTimeout(getDateList,300);
}

@Form.create()
export default class TagReaderEdit extends PureComponent{
  state = {
    siteNameData:[],
    value:''
  }

  handleChange =(value) => {
    this.setState({value});
    doFetch(value,siteNameData => this.setState({siteNameData}))
  }

  render() {
    const {data, record, editModalVisible, form, handleEdit, handleEditModalVisible } = this.props;

    const { getFieldDecorator, getFieldValue } = form;

    //位置下拉列表
    const children = this.state.siteNameData.map(d => <Option key={d.value}>{d.text}</Option>)
  
    const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      this.props.handleEdit(record.key,fieldsValue);
    });
  };

const formItemLayout = {
  labelCol: {
    xs: { span: 5 },
  },
  wrapperCol: {
    xs: { span: 15 },
  },
};
const inputNumStyle = {
    width:'100%'
};
  return (
    <Modal
      title="编辑读卡器信息"
      visible={editModalVisible}
      onOk={okHandle}
      onCancel={() => this.props.handleEditModalVisible()}
    >
    <FormItem {...formItemLayout} label="读卡器名称">
    {
      getFieldDecorator('ReaderId', {
          rules: [{
              required: true,
              message: '必须输入读卡器名称'
          }, {
              validator: record.name
          }],
      })( <Input placeholder = "请输入读卡器名称" / >
      )
    }
    </FormItem>

    <FormItem {...formItemLayout} 
    label="所在位置"
    key='SiteName'
    >
        <Select
        mode="combobox"
        //allowClear=true
        style={{ width: '100%' }}
        placeholder="请选择所在位置"
        value={this.state.value}
        defaultValue={record.siteName}
        onChange={this.handleChange}
    >
        {children}
    </Select>
    </FormItem>   

    <FormItem {...formItemLayout }
    label = "备注" > {
        getFieldDecorator('Memo', {
            rules: [{}],
            initialValue:record.memo
        })( <
            TextArea style = {
                { minHeight: 32 }
            }
            placeholder = "请输入备注"
            rows = { 4 }
            />
        )
    } 
    </FormItem> 

    </Modal>
  );
  }
}
