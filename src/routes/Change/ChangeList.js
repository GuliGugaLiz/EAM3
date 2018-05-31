import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { Row, Col, Card, Form, Input, Select, Icon, Button, Dropdown, Menu, InputNumber, DatePicker, Modal, message, Badge, Divider } from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import ChangeEdit from './ChangeEdit';

import styles from './ChangeList.less';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');



const CreateForm = Form.create()((props) => {
  const { modalVisible, form, handleAdd, handleModalVisible } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      handleAdd(fieldsValue);
    });
  };
  return (
    <Modal
      title="新建规则"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <FormItem
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 15 }}
        label="描述"
      >
        {form.getFieldDecorator('desc', {
          rules: [{ required: true, message: 'Please input some description...' }],
        })(
          <Input placeholder="请输入" />
        )}
      </FormItem>
    </Modal>
  );
});

@connect(({ change, loading }) => ({
  change,
  loading: loading.models.change,
}))
@Form.create()
export default class TableList extends PureComponent {
  state = {
    modalVisible: false,
    editModalVisible:false,
    expandForm: false,
    selectedRows: [],
    formValues: {},
    record:{},
    filteredInfo:null
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'change/fetch',
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
      type: 'change/fetch',
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
      type: 'change/fetch',
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
          type: 'change/remove',
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

      dispatch({
        type: 'change/fetch',
        payload: values,
      });
    });
  }

  handleItemEdit = (record) => {
    this.handleEditModalVisible(true);

    this.setState({
      record:record
    });
  }

  handleModalVisible = (flag) => {
    this.setState({
      modalVisible: !!flag,
    });
  }

  handleEditModalVisible = (flag) => {
    this.setState({
      editModalVisible: !!flag
    });
  }

  handleAdd = (fields) => {
    this.props.dispatch({
      type: 'change/add',
      payload: {
        description: fields.desc,
      },
    });

    message.success('添加成功');
    this.setState({
      modalVisible: false,
    });
  }

  handleEdit = (id,fields) => {
    this.props.dispatch({
      type:'change/update',
      payload:{
        id:id,
        description:fields
      }
    });

    message.success('修改成功');
    this.setState({
      editModalVisible:false
    });
  }

  handleDelete = (selectedRows) => {
    const { dispatch } = this.props;
    const confirm = Modal.confirm;
    confirm({
      title: '确定删除选中的数据吗',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk()  {
        dispatch({
          type:'change/remove',
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
        
      </Form>
    );
  }

  renderForm() {
    return this.state.expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
  }

  render() {
    const { change: { data }, loading } = this.props;
    const { selectedRows, modalVisible,editModalVisible,record } = this.state;
    const parentMethods = {
      handleAdd: this.handleAdd,
      handleEdit:this.handleEdit,
      handleModalVisible: this.handleModalVisible,
      handleEditModalVisible:this.handleEditModalVisible
    };

    let {filteredInfo} = this.state;
    filteredInfo = filteredInfo || {};

    const columns = [
      {
        title: '编号',
        dataIndex: 'Id',
      },
      {
        title: '标签编号',
        dataIndex: 'tagId',
      }, {
        title: 'EPC编码',
        dataIndex: 'EPCCode',
      },{
        title:'资产名称',
        dataIndex:'assetName',
      },/*{
        title:'资产编号',
        dataIndex:'AssetId',
      },*/
      {
        title: '之前位置',
        dataIndex: 'LastSiteId',   
      },{
        title:'当前位置',
        dataIndex:'CurrentSiteId'
      },{
        title: '审核人员',
        dataIndex: 'CheckUserId',   
      },{
        title:'是否通过',
        dataIndex:'IsPass',
        filters:[{
          text:'未通过',value:0
        },{
          text:'通过',value:1
        }],
        filterdValue:filteredInfo.IsPass || null,
        onFilter: (value, record) => record.IsPass.toString() === value,
        render: val => {
          let style = {}
          let t = ""
          if(val===0)
          {
            style= {color:"red"}
            t = "未通过"
          }else if (val===1){
            style= {color:"green"}
            t = "通过"
          }
          return <span style={style}>{t}</span>
        },
      },
     /* {
        title: '维护人员',
        dataIndex: 'maintainer',
      },*/
      {
        title: '时间',
        dataIndex: 'CreateTime',
        sorter: true,
        render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm')}</span>,
      },
      {
        title: '操作',
        render: (text,record,index) => (
          <Fragment>
            <a key={index} onClick ={() => {this.handleItemEdit(record)}} >编辑</a>
          </Fragment>
        ),
      },
    ];

    return (
      <PageHeaderLayout>
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              {this.renderForm()}
            </div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleAddModalVisible(true)}>
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
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>       
        <ChangeEdit
        {...parentMethods}
        modalVisible={editModalVisible}
        record={record}
        />
      </PageHeaderLayout>
    );
  }
}
