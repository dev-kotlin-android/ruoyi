<template>
  <div class="app-container">
    <el-form ref="form" :model="form" label-width="80px">
      <el-form-item label="会议名称">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="会议描述">
        <el-input v-model="form.text"></el-input>
      </el-form-item>
      <el-form-item label="选择时间">
        <!-- <el-date-picker
          v-model="value1"
          
          :default-time="['12:00:00']"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker> -->
         <el-date-picker
      v-model="value1"
      type="datetimerange"
      value-format="yyyy-MM-dd HH:mm:ss"
      start-placeholder="开始日期"
      end-placeholder="结束日期"
      :default-time="['12:00:00']">
    </el-date-picker>
      </el-form-item>
      <el-form>
        <el-form-item>
          <el-button type="primary" round @click="create()">新建会议</el-button>
        </el-form-item>
      </el-form>
    </el-form>
  </div>
</template>

<script>
import Treeselect from "@riophae/vue-treeselect";
import "@riophae/vue-treeselect/dist/vue-treeselect.css";
import IconSelect from "@/components/IconSelect";
import { createhui } from "@/api/conference/index";
import { getInfo } from "@/api/login";
export default {
  components: { Treeselect, IconSelect },
  data() {
    return {
      // userId:3,
      value1: "",
      form: {
        name: "",
        text: "",
        region: "",
        date1: "",
        date2: "",
        delivery: false,
        type: [],
        resource: "",
        desc: ""
      },
      userId: null
    };
  },
  methods: {
    dateChangebirthday1(val) {
      this.startTime = val;
      console.log(this.startTime);
    },
    onSubmit() {
      console.log("submit!");
    },
    // 获取用户详细信息
    userdetail() {
      getInfo().then(res => {
        console.log(res);
        this.userId = res.user.userId;
        console.log(res.user.userId);
      });
    },
    // 创建会议
    create() {
      //   var that = this;
      const data = {
        userId: this.userId,
        conferenceName: this.form.name,
        conferenceMark: this.form.text,
        startTime: this.value1[0],
        endTime: this.value1[1],
        joinUserId: Date.now()
      };
      console.log(data);
      console.log(data.userId);
      createhui(data)
        .then(res => {
          cosnole.log(res);
        })
        .catch(err => {
          console.log(err);
        });
    }
  },
  created() {
    this.userdetail();
  }
};
</script>

<style lang="scss">
</style>