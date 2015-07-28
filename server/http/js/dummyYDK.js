// dummyYDK.js
// simulates the .ydk-files sent through Primus
var deckfiles = {
    "Yang Zing.ydk": parseYDK("#created by ...\r\n#main\r\n58990362\r\n58990362\r\n99946920\r\n30106950\r\n30106950\r\n30106950\r\n66500065\r\n66500065\r\n66500065\r\n21495657\r\n2095764\r\n2095764\r\n25935625\r\n25935625\r\n25935625\r\n35089369\r\n35089369\r\n61488417\r\n61488417\r\n61488417\r\n2295440\r\n12580477\r\n17183908\r\n17183908\r\n17183908\r\n53129443\r\n53129443\r\n54447022\r\n5318639\r\n5318639\r\n27243130\r\n27243130\r\n53582587\r\n57728570\r\n30398342\r\n30398342\r\n30398342\r\n35561352\r\n35561352\r\n84749824\r\n#extra\r\n41517789\r\n8561192\r\n19048328\r\n19048328\r\n83755611\r\n83755611\r\n83755611\r\n43202238\r\n43202238\r\n7391448\r\n36898537\r\n88033975\r\n79606837\r\n79606837\r\n15240238\r\n!side\r\n23434538\r\n23434538\r\n97268402\r\n97268402\r\n5133471\r\n5133471\r\n98645731\r\n98645731\r\n98645731\r\n14087893\r\n29401950\r\n59616123\r\n59616123\r\n5851097\r\n82732705"),
    "ClownBlade.ydk": parseYDK("#created by ...\r\n#main\r\n65367484\r\n65367484\r\n67696066\r\n67696066\r\n67696066\r\n68819554\r\n68819554\r\n25259669\r\n25259669\r\n25259669\r\n1833916\r\n31292357\r\n31292357\r\n31292357\r\n1845204\r\n1845204\r\n1845204\r\n12580477\r\n32807846\r\n32807846\r\n32807846\r\n57734012\r\n70368879\r\n70368879\r\n70368879\r\n92365601\r\n92365601\r\n96142517\r\n96142517\r\n5318639\r\n5318639\r\n5318639\r\n11705261\r\n11705261\r\n11705261\r\n5851097\r\n50078509\r\n50078509\r\n50078509\r\n84749824\r\n#extra\r\n17412721\r\n17412721\r\n10443957\r\n12744567\r\n56832966\r\n58069384\r\n86532744\r\n56840427\r\n84013237\r\n84013237\r\n48739166\r\n18326736\r\n7194917\r\n52653092\r\n52653092\r\n!side")
};
$(function() {
    var deckfile,
        deckSelect = $('.deckSelect');
    for (deckfile in deckfiles) {
        deckSelect.append('<option value="' + deckfile + '">' + deckfile.replace('.ydk', '') + '</option>');
    }
    deckSelect.on('change', function() {
        drawDeckEditor(deckfiles[$(this).val()]);
    });
});