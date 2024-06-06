<template>
  <div class="full-screen-container">
    <b-row style="padding: 20px; height: 100%; margin: 0;">
      <b-colxx lg="12">
        <p class="message-box">Hi, Welcome To Your Todo List</p>
      </b-colxx>
      <b-colxx lg="6" class="col-card-infos">
        <CardInfoTasks
          category="Personal"
          cardColor="#ffc397"
        />
      </b-colxx>
      <b-colxx lg="6">
        <CardInfoTasks
          category="Business"
          cardColor="#ffa8f6"
        />
      </b-colxx>
    </b-row>
  </div>
</template>

<script>
import CardInfoTasks from "@/components/Common/CardInfoTasks.vue";

export default {
  name: 'HeaderComponent',
  components: { CardInfoTasks },
  props: {
    username: String
  }
}
</script>

<style scoped>
.full-screen-container {
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 2px 0 25px rgba(0, 0, 0, 0.3) !important;
  background: #7289DA;
  border-bottom-left-radius: 50% 20%;
  border-bottom-right-radius: 50% 20%;
  height: 300px;
  width: 100%;
}

.message-box {
  font-size: 24px;
  color: white;
  background: #4A6EA9;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

@media screen and (max-width: 991px) {
  .col-card-infos{
    margin-bottom: 25px;
  }
}
</style>
