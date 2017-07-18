/**
 * Created by Administrator on 2017-07-05.
 */
;(function () {
    'use strict';


    //声明全局变量
    var add_task_from = $('#addform')
        , task_list = []
        , delete_btn
        , detial_btn
        , bg = $('.bg')
        , detialdiv = $('.detial')
        , close = $('.close')
        , detialConform = $('.updateform')
        , current_index
        , update_btn
        , complete_chose
        , msgdiv = $('.msg')
        , contentMsg = $('.contentmsg')
        , surebtn = $('.sure')
    ;
    var list_item_tpl = '<div class="item">' +
        '<input type="checkbox" class="chose">' +
        '<san class="show">将要去执行的事情+</san>' +
        '<span class="delete">删除</span>' +
        '<span class="detialCheck">详情</span>' +
        '</div>';
    init();
    //给form表单绑定提交事件
    add_task_from.on('submit', function (e) {
        //添加时存放数据的对象
        var new_task = {};
        //阻止系统某些默认行为
        e.preventDefault();
        //获取新task的值
        var input = $(this).find('input[name=add]');
        new_task.content = input.val();
        //new_task值为空则直接返回
        if (!new_task.content) return;
        //存入新的task
        if (add_task(new_task)) {
            //增加后使输入框显示为空
            input.val(null);
        }
    });

    //实现添加功能
    var add_task = function (new_task) {
        //将新的task推入到task_list中
        task_list.push(new_task);
        //更新localStorage中
        update_show_list();
        return true;
    };
    //更新localstorage并渲染
    function update_show_list() {
        //使用插件store实显数据的本地存储
        store.set('task_list', task_list);
        //刷新显示列表
        render_task_list();
    };

    //绑定删除按钮的点击时间
    function delete_task_item() {
        delete_btn.on('click', function () {
            var $this = $(this);
            var item = $this.parent();
            var data_index = item.data("index");
            var sure = confirm("确定要删除吗？");
            sure ? delete_task(data_index) : null;
        });
    };
    //实现删除功能
    function delete_task(index) {
        if (index == undefined || !task_list[index]) {
            return;
        }
        //删除点击下标的item
        delete task_list[index];
        //更新localstorage并重新渲染
        update_show_list()
    };
    //实现详情显示功能
    function show_detial() {
        var data_index;
        $('.item').on('dblclick', function () {
            data_index = $(this).data('index');
            show_detial_task(data_index);
            detial_show(data_index);
        });
        detial_btn.on('click', function () {
            var $this = $(this);
            var item = $this.parent();
            //获取每一条task的index
            data_index = item.data("index");
            current_index = data_index;
            show_detial_task(data_index);
            detial_show(data_index);
        });

    };

    function detial_hide() {

        bg.css('display', 'none');
        detialdiv.css('display', 'none');
    };
    //关闭详情div
    close.on('click', detial_hide);
    //显示细节弹出层
    function detial_show(index) {
        bg.show();
        detialdiv.show();
    };



    //显示细节内容
    function show_detial_task(index) {
        var item = task_list[index];
        var str = '<form>' + '<div class="detialCon" >'
            + '<input name="con" type="text" class="con" value="' + item.content + '">'
            + '<textarea name="desc" class="desc" cols="24" rows="6">' + item.desc + '</textarea>'
            + '<input type="text" name="remaindate" id="date"  placeholder="提醒日期" value="' + item.remaindate
            + '">'
            + '<input type="text" name="remaintime" id="time"  placeholder="提醒时间" value="' + item.remaintime
            + '">'
            + '</div>'
            + '<input type="submit" value="修改" id="update" >' + '</form>';

        detialConform.html('');
        detialConform.html(str);
        update_btn = detialConform.find('form');
        //使用插件pickadate实现日期时间的选择
        $('#time').on('dblclick', function () {
            $('#time').pickatime();
        });
        $('#date').pickadate();
        // $('#time').pickatime();

        update_btn.on('submit', function (e) {
            e.preventDefault();
            var date = {};
            date.content = $('[name = con]').val();
            date.desc = $('[name = desc]').val();
            date.remaindate = $('[name = remaindate]').val();
            date.remaintime = $('[name = remaintime]').val();
            update_detial_task(index, date);

        });

    };
    //修改内容
    function update_detial_task(index, date) {

        update_task(index, date);
        var sure = confirm('更新成功，返回首页？');
        sure ? detial_hide() : null;
    };
    //更新内容操作
    function update_task(index, date) {
        if ((index < 0) || !task_list[index])
            return;
        //jq使用extend，js使用merge，这两个函数是用第二个数组合并更新第一个数组
        task_list[index] = $.extend({}, task_list[index], date);
        update_show_list();
    }
    //标记已经完成的task
    function completeTask() {
        complete_chose.on('click', function () {
            // var index=$(this).parent().data('index');
            var $this = $(this);
            var item = $this.parent();
            //获取每一条task的index
            var index = item.data("index");
            var item = store.get('task_list')[index];
            if (item.complete) {
                update_task(index, {complete: false});
            }
            else {
                update_task(index, {complete: true});
            }
            // var item1=store.get('task_list')[index];
            // console.log(item1.complete);
        });
    };
    // 实现提醒功能,实现每一次检查task_list中是否有要提醒的item
    function task_remaind_check() {
        // show_msg("aaaa");
        var current_time;
        console.log(task_list);
        var itl = setInterval(function () {

            for (var i = 0; i < task_list.length; i++) {
                var item = store.get('task_list')[i];
                if (!item || item.remaintime == undefined || item.remaindate == undefined || item.informed)
                    return;

                // var times=getTimes(item.remaintime);
                var rec=(item.remaintime).split(':');
                var rec1=rec[1].split(" ");
                var times;
                if (rec1[1] == "PM"){
                    return times=(rec[0]+12)*3600000+rec1[0]*1000;
                }
                else {
                    return times=rec[0]*3600000+rec1[0]*1000;
                }
                console.log('times',times);
                var task_time=(new Date(item.remaindate)).getTime()+times;
                current_time = (new Date()).getTime();
                // console.log('task_time',task_time);
                // console.log('current_time',current_time);
                if ((current_time - task_time) < 1) {
                    update_task(i, {informed: true});
                    show_msg(item.content);
                }
            }
        }, 500);
    };
    function listen_sure() {
        surebtn.on('click', hide_msg);
    };

    function show_msg(msg) {
        contentMsg.html(msg);
        // msgdiv.css('display','block');
        msgdiv.show();
    };
    function hide_msg() {
        // msgdiv.css('display','none');
        msgdiv.hide();
    };
    //根据时间获取毫秒数
    // function getTimes(timesum) {
    //     var rec=(timesum).split(':');
    //     var rec1=rec[1].split(" ");
    //     var times;
    //     if (rec1[1] == "PM"){
    //         return times=(rec[0]+12)*3600000+rec1[0]*1000;
    //     }
    //     else {
    //         return times=rec[0]*3600000+rec1[0]*1000;
    //     }
    // }

    function init() {
        //store.clear();
        task_list = store.get('task_list') || [];
        if (task_list.length >= 1) {
            render_task_list();
        }
        task_remaind_check();
        listen_sure();
    };
    //渲染task列表
    function render_task_list() {
        var task_item = $('.list');
        task_item.html('');
        var complete_list = [];
        var i, indexs = [];
        for (i = 0; i < task_list.length; i++) {
            if (task_list[i] && task_list[i].complete) {
                complete_list.push(task_list[i]);
                indexs.push(i);
            }

            else {
                var task = render_task_tpl(task_list[i], i);

            }
            //prepend是在前插入
            task_item.prepend(task);
        }
        for (var j = 0; j < complete_list.length; j++) {
            var task = render_task_tpl(complete_list[j], indexs[j]);
            if (!task)
                continue;
            task.addClass("completeItem");
            //append是在后插入
            task_item.append(task);
        }
        delete_btn = $('.delete');
        detial_btn = $('.detialCheck');
        complete_chose = $('.chose');
        //每一次渲染后都给删除绑定事件
        delete_task_item();
        show_detial();
        completeTask();
    };
    //显示每一条task
    function render_task_tpl(data, index) {
        if (!data || (index < 0)) {
            return;
        }
        list_item_tpl = '<div class="item" data-index=' + index + '>' +
            '<input type="checkbox" ' + (data.complete ? 'checked' : '') + ' class="chose">' +
            '<span class="show">' + data.content + '</span>' +
            '<span class="delete">删除</span>' +
            '<span class="detialCheck">详情</span>' +
            '</div>';
        return $(list_item_tpl);

    };
})();