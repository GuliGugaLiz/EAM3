import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Badge, Divider,Layout } from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import ClassEdit from './ClassEdit';
import ClassImport from './DepartmentImport';

import styles from './AssetClass.less';

const FormItem = Form.Item;
const { Option } = Select;
const {Content} = Layout;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

@connect(({ datadictionary, loading }) => ({
    datadictionary,
  loading: loading.models.datadictionary,
}))
@Form.create()
export default class AssetClass extends PureComponent {
  state = {
    importModalVisible: false,
    editModalVisible:false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
    record:{}
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'datadictionary/fetchdept',
    });
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'datadictionary/fetchdept',
      payload: params,
    });
  }

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'datadictionary/fetchdept',
      payload: {},
    });
  }

  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
  }

  handleMenuClick = (e) => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (!selectedRows) return;

    switch (e.key) {
      case 'remove':
        dispatch({
          type: 'datadictionary/removedept',
          payload: {
            no: selectedRows.map(row => row.no).join(','),
          },
          callback: () => {
            this.setState({
              selectedRows: [],
            });
          },
        });
        break;
      default:
        break;
    }
  }

  handleSelectRows = (rows) => {
    this.setState({
      selectedRows: rows,
    });
  }

  handleSearch = (e) => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      this.setState({
        formValues: values,
      });
      console.log(values)

      dispatch({
        type: 'datadictionary/fetchdept',
        payload: values,
      });
    });
  }

  handleImportModalVisible = (flag) => {
    this.setState({
      importModalVisible: !!flag,
    });
  }

  handleEditModalVisible = (flag) => {
    this.setState({
      editModalVisible: !!flag,
    });
  }

  handleItemEdit = (record) =>{
    this.handleEditModalVisible(true);

    this.setState({
      record:record
    });
  }

  handleImport = (fields) => {
    this.props.dispatch({
      type:'datadictionary/importdept',
      payload: {
        description: fields.desc,
      },     
    });

    message.success('添加成功');
    this.setState({
      addModalVisible: false,
    });   
  }

  handleEdit = (Id,fields) => {
    this.props.dispatch({
      type:'datadictionary/updatedept',
      payload:{
        Id:Id,
        description:fields,
      },
    });
    message.success('修改成功');
    this.setState({
       editModalVisible:false,
     });
  }

  handleDelete = (selectedRows) => {
    const { dispatch } = this.props;
    const confirm = Modal.confirm;
    confirm({
      title: '确定删除选中的数据吗',
      //content: 'Some descriptions',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk()  {
        dispatch({
          type:'datadictionary/removedept',
          payload:{
            ids: selectedRows.map(row => row.id).join(','),
          },
        });
        console.log(selectedRows.map(row => row.id).join(','))
      },
      onCancel() {
        //console.log('Cancel');
      },
    });    
  } 

  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="资产名称">
              {getFieldDecorator('name')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>          
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }


  renderForm() {
    return this.renderSimpleForm();
  }

  render() {
    const { datadictionary: { dept }, loading } = this.props;
    const { selectedRows, importModalVisible, addModalVisible, editModalVisible, record } = this.state;
    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="remove">禁用</Menu.Item>
      </Menu>
    );

    const parentMethods = {
      //handleAdd: this.handleAdd,
      handleEdit:this.handleEdit,
      handleAddModalVisible: this.handleAddModalVisible,
      handleImportModalVisible: this.handleImportModalVisible,
      handleEditModalVisible: this.handleEditModalVisible,
    };
  const columns = [
  {
    title: '编号',
    dataIndex: 'Id',
  },
  {
    title: '名称',
    dataIndex: 'Name',
  },
  {
    title:'创建时间',
    dataIndex:'CreateTime',
    render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm')}</span>,
  },
  {
    title:'创建者',
    dataIndex:'CreateAccount',
  },
  {
    title:'备注',
    dataIndex:'Memo',
  },
  {
    title: '操作', dataIndex: '', key: 'operation',
    render: (text, record, index) => 
    <a name="edit" key={index} onClick={() => this.handleItemEdit(record)}>编辑</a> },
];

    return (
      <Content>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              {this.renderForm()}
            </div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleImportModalVisible(true)}>
                导入
              </Button>
              {
                selectedRows.length > 0 && (
                  <span>
                    <Button icon="delete" type="primary" onClick={() =>
                    this.handleDelete(selectedRows)}>删除</Button>                   
                  </span>
                )
              }
            </div>
            <StandardTable
              rowKey = {rec=>rec.Id}
              selectedRows={selectedRows}
              loading={loading}
              data={dept}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        <ClassImport
          {...parentMethods}
          modalVisible={importModalVisible}
        />   
        <ClassEdit
        {...parentMethods}
        modalVisible={editModalVisible}
        record = {record}   
        />  
      </Content>
    );
  }
}
