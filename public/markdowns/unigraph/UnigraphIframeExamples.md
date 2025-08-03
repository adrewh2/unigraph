---
title: "How to Use Iframes in Unigraph"
tags: ["documentation", "components", "iframe", "embedding", "examples"]
---

# How to Use Iframes in Unigraph

This guide shows you how to embed the full Unigraph application as an iframe.

## Basic HTML Iframe

This is the most basic example using standard HTML iframe tags to embed the app with no customization.

```html
<iframe
  src="https://unigraph.vercel.app"
  width="100%"
  height="600px"
  style="border: none;"
>
</iframe>
```

<iframe
  src="https://unigraph.vercel.app"
  width="100%"
  height="600px"
  style="border: none;"
>
</iframe>

### Loading a specific graph from server

It will be possible to publish and share projects online. Projects can be configured ahead of time, and then shared like so:

```html
<iframe
  src="https://unigraph.vercel.app/?graph=unigraphApplications&view=ReactFlow"
  width="100%"
  height="600px"
  style="border: none;"
>
</iframe>
```

<iframe
  src="https://unigraph.vercel.app/?graph=unigraphApplications&view=ReactFlow"
  width="100%"
  height="600px"
  style="border: none;"
>
</iframe>

### With data url

Graph data can be exported from Unigraph as URL encodings for sharing with other clients.

```html
<iframe
  src="${unigraphBaseUrl}/#scenegraph=y9a926G1jz..."
  width="${width}"
  height="${height}"
  style="border: 1px solid #ccc; display: block; background: #fff; width: ${width}px; height: ${height}px;"
  title="Unigraph Factor Graph Example"
  allowfullscreen
>
</iframe>
```

<iframe
    src="${unigraphBaseUrl}/#scenegraph=N4IgJghgLhIFygOYCcIAcAW9QDsD2YApgM7wDaoaexAllDXjtiAB7wCsADADQgCeHHiABe8TgF9eNYgDVpNAEYAbQvCjIAroV4BjPErzJ4IZIgUAKAIyceAAktdutgEzt2AShC9aw1XEsAdOy8eGgQOnQC-lJgxgAall4gUHxofiAAbhDINBDKqrxKeYRK8Ym8YDQAtoQ4tIykCCAA7jRgUFj+AGy8GIQ0iBhQ8JZdkiAAZoxQAML6hsamFnYrnt4Y6OkRyDoqSQqGRMgA6m0d8M68B8hHcwZGcCZm5q7B9gCcAOxOXWvJEIhGmQALq8DTEQjIAAi0FgCHEkko1DoDCYTTY-kc-EEvFEcAkUlk8nyak02hAenui2e1jsDjsrz+Pj8gWCIFC4UiIxi8WcSRSaWMWRyeT2hWKpUecT5FWqtXqdWYrXanVGvX6g2G3XGUxws3mDyeyycqySxA2gse212BRA1yOpxVFyuh0hdwWjyWLzcTksXx+fxggPIoJA4MhMJg2AR3CRtHojGYGNcQiiWLxBJA0jktBJcHUWl0BupFlpvscLjcTJovhGQRCYQiKW5WdiUoAzPzUulhbkSeKFCV4p3ZTU6qjGqBleduuqBkMRmNeLr9VTPc8ViamRatjQdmK7a6TmdOpdDzc3cX1xZXr7-bZfvyAUDQ+HobDo4iQFR46ik-B2yxNMhAzcZs2JPZ8zJIs1yNKwbHLBkqzNGsWXrdlGy5aJW3iAAWLtLUybI+wPIpB0lEA4nw0d5QnJUT0XOdNUXHVpndQ0vU3WxOG3TZjGtA97UhR0ZzPITkHYktvTeP1vgfQNnxDMEIXfKN4S-H8UUTdF4FwoCcREMQwKJXNIILclKQ9OCy3sCtGRQ2t-HQjkmyiSweSldgCJ7YjRVtMih08pJKjHBVJxaBjZxAPp5y1UZWL1STr3MLieLNHd+L3G19iPETTxdC8JKvODbw+OTH14IMX2UiMP3U2Nv2RBM0VADF9MxECjMJHNFDM6CKWKr0bPpJx7O8VC6zZFysPcnCpS6byhV8-sQACii4gWmjxwaeinSimLmO1Zc2MGjcTS3dK+KtLLBNyyKxKPJKSp9MqAyfYM4BBGrVLhYAYzjLSWtYEZ2pGwz8WMnq83MmCrKGhDbKQjwHLQqbMObbC2niT5FseXs-KSNbseCuVtsVJpp1VHpoo1BcjsmE7YM487uN4wiBNtcS8udc9blOm8Xtkt7KsUz7XxUyNfv+xrf201qLlB9MuqzEzer8GGBqZmkEZGytkfGxzWQbTkMdmrGpQADlxoiRRWonLZJ0K6IpyK1Rp2KWOOxL+ZSlm0vWK6KRuzm7r2h7Cqer1SqF+T3uqsMJbqv6NKav8dLgQDUxBzqIe6iD1f6yyOO1uk7OQg3UeN1yW3Nyj3mt-G7YleJ662sLdpnN2Drp+KvdXOGzu4i6A-Z4OcsK7m4HDvmtYFmT7wq-4Pq+hParU5OGs05r-zgPSs463FlfA0yC8LTWB9LHWy-1kBmUmquZo8yjrAb5bSObqUX7b52p1d6nu7ikuBm3tZ6+yHqzS6o99whwnvdAqM8L7STvOVBSy9xZrylinWWQM2r7xTIfXOKsoZ9TPkXKSw1r7VkNs5dGbkn4JHKMkbsS1bbv3ImURhIVaI7RdntLutNAEJX7sXY04D-a3wytdaB48HRwN5peUB0cF6oPjm+SWn5N6pzlsDA+2Ip5K0IcfNWpJSE+woUjKhlcMImzoXNZ+MomGEUbmwwK9jHbcPJr-Ph-8BGe2AcIqSqU2a7mkfA4ScjxKR2eEolBcclKrx+hogG29074L0Wk0CecT4mIsmYq+FiUb32sdXTGbZn4jkcT5Vh-kP7lPcWTcKlNGLu0Or3fxUTRGmhHiE7KYTjxhz6R0pBr1Y4izQd9dR9Vklp3lhndqGSj6q2hoXPJpcCkVyKdNU29DLDUUqSwkiNT2Gfz2VwhpHcqZMR7kAlcQygmQJ6bdWBAz5FFUUYLZRcSxYTKTtLLeMydF714FEBZhilkkNyaA8xo1y63wmk5NGNia5lISF5SqzC8ZvyOa41F9T268M7j4j29Nbk+3ud0zKoTXmT2ngoxBMThZL1UYndefytE4IMlETOBDMxGOWaYqF+SYU3zvgih+2y7EJE2vszF1TCa1KlXin+EVvFXMEX3O5ftgmUt6dSiJj0fYMtGUy+JajflYMBjvMGXKDG8vBafSFiDoV60sZs2hyKyg43RU4rF8rjnPy9eAUm+KvGErVX40loDyUSMDhzGR4SXmRMNR82JYzmUYKSTLS1qT2rcvBna4hDrYYiPgms4VrqxXFMfpKywVtvVVMOX6nFtalU8NDZclp1yhGarEdqqRuqub6ojsm+eqaTXfISZMje0ztEYjzTanOBb845OLeQoVLrCmVq2bY2uCRW4ypto2gczb91nJDSqsNnb1XtLJVqh5OqnmyMTQa95o7GVVVNSyzBmjsE7yBXovNmSiHLqggKp166xpwuoYikpZsUXOE4K-OVx71oIdbZ4i9HaAERsZog6N5pY1jz6TSwZI7kHvtFivM1rKLUpNmWWPRtrIYgY1mQ5K0cKy0grYEM826PWPAmIwgU6QJjhCgAsFDxhBPocaX-cNJLcMlvw5I2+ABHDQ2QYFPtEqR195HjUfondR79M6OVTwQoxxdzHsmgcdSWjjdIbDcYCLx91pSpMOOE1JsTEnVq1ImA4s9yqmn7V8QpkBeG70UseMQdTmn439J068oZRrF6Gao1+zN-zZ0AQs8BHl1njG2dXexwWnGnObp4+KndZSJgVK8wJnzRhJMCYqUFttmHmnYfCwE5KynA6xY08gLTCaktJr0yMtLlH0GJKmVmujgK8sGSA3yiFJXnoyXK+I0VVWq0StrhMPZDXJhNabRRQ7MmLldbC20yNkXe33pi3F4bCWSPJbI5NlRn6M1zey2ZhjbkmNZKK6xj7usuOVZc9V-jkw0UHtEzocTzW-P+omHD9rGGQv8OJbdxTgSosxsIoN+LxGh0IPsymij4zJ3mp-dm2ZCH95gxW-ald58Kebcc9t+Fu2+PuYE9K47COkdnak9KjHsnVVXpwxFpTBOCNE+eyNxL+V3sTZjlN6nxmsvsp3u2JbuiWeFrZ2xjbiFfQVY2U5VzSL+eTEDUL07LX7eXYJVhm7Ny8d9flyp4nL3SfPuHerz5abvuzenfNgFGJcIG+Z4s43xX2dSQcxb7n1CbewafhMOt8Onco9cdn137brs4897L-HD3otqaG8rt7436WU4M9Nn5NG6cLYxADhWVngf8rs8nsrXPnMZ+rQd-djvEe+ftpMU9wbgtyelz1ntXTCfpD97XsndKOf6c1+m8PbLf2pIN6CpdNnQfq620P6HdvBOIfrd5ifyOp836L510Lpfu23sryv4wa-Xsb7eQ3m+k3lrplr9rrunPrngkDsBqfisufoPpDsPvtrVpYEJhiidg-qLgJqgS-ljkSq0mXr1nBP1orjXn-oHuTv3kATvmHlOvvvTotlAd3jASDnAYAebvYJblBmhEgTVlJpYJ5ugcLpPv5gIbgfPt1rjuXt7l-grqvkruQWNi+uwZ9l8hlj9hHn9lagboBvHixmwVvojKnpfntnwdgfVkIXnk-pYG1rPh1ngfJlIUQczLIb7goQHkoUHioRrl9kZqAZoeAQzjodAatkWknqVpzsYYgVfnBvwUdpYZgc7oJqcnYZjhIR7h-lGj7gNu4XqhQZvlQdvr4eoXvrRlHrlvvLoWCgnmft4RftEaYTDoJnDuPiLkkQ4OIVLpIYQUvsPN-k9mQR4arvXoYT4WoTNnQWUTlrvMEcwaESbmDvUVbrzm5rEdgYLgkW0fnudqMJ0Zet0ZkfdsvnIT-rkYOvkQAaMSHuOiUZMW3uUXAKDBZkbvoWBqMUsdwXWLwU0ZYA7psSIajr8Xse7u-hqp-scW4YMXkZ4ZQREUUeMS3iZpHtMfMs8XobAW8YUUYZwWnjwTEVni2nfo1okdsfwTnhLldm-gQYcXLq4TkVCecTCQUXCaoaHn4RofQe3pyhUQVj3mtuEWbtiRDssVDo0dfn6NbMIY-qITPk7PYekaCTelkXSaQSTtCcMcoVcWOulhMbTqZlak8XMazonqblHAPlESKd8dfmhkSRgVsU-jaUGnKWkV0RkWCcqRCfSWqYyRqV4VqVTrvncfqenNahcGidUa8X3iyeDlwTtqKXzmsZMM4GgYRFKVgUmZwqkZLvsW6UqUcX0ScQMd6aHEyZcViWMWybcXqcif9rmuGSfqwZidGR8XGVaYmQFoIamVYf5s4IFlmZSdjtSe6fmRAlXr-kMTzCMeWdcTqYiTrgfgzoabySwb3utmaZETiSYQmVns4BYV2SSQ6bYc6dmSCUOXmbSZ6aqf7uqZOZqdOdqc3jTq3sGYuXgvWYVquQKeuRwcKZ8dbviXYgFvEfufaT2SkceQOfgV2sOReQWZCcWc8qWSlo3jQeyaUfcdMWklyu+XyWEaadEuaZuQ0duYBa4JKd2ajmRd-PKa6YqXdrBaOf0dXghdpr6bCYKRWTcbqc+TWXrkufmh+fyfhXPD+bGTzvGasTuRsSBQCQXs4OLv2W7iXmefRRXpefIQySWWxcyRxTOY+drmAQuTovOmGUaTUQYeWS2eJW2TuX8TJdKZRYGhSUpVSdBeeWpXBV6deT6beX6feQGbQdWVoRAXWWZZGWuQRRub+a2QBQds4Dnq0bJedvFcCcpW5apTIepacZpYhdpWWdGXpSARyVMWZv+m5DhSuUJYsQgZabFbVs4GPv8Q5XJbKR4ieWldehlcQdkVeevhcchdQcUdxUicFbMmVaZcufMSadVRaX+Ssbbu2fruRQef5ktdRS6TmXRV7t1SqRpSxaNnlQNfCZWcNfOQwdHqFZNcabUe8TVXNRJQtVnu2CmSJhRQXs9ala5Z1dtS4VlUWd5Vpb5exd+ayVxXOYZedSMLHhVVNTdZZXdTFWKYtZ2a9Staju2H2RBS5YOelT9YPH9cxQDblUDTpSDZxbOU+SNYEcZdDWFRiVGRxVZennVVJu2HuajaBejUeW1ZBY4T0eCZ5b1YoYdWDoVYGUFdTcmEfjDddRZc2QjdZSza1sBRzUlazeBTzdjVBd9dITtQTeOTeVPLpt4WLYFTxaNYwcChNQJbhQsfAbNYjSRQdoBMtZze9ejopcXl9TLs4fjYLXtUTaxSTflbpQ+UVehS+Top3hnDLeZU2YzQrczUjU9dJarc1edu2ApVjV7TjTrb7Z0v7dlftSrsHUdaDRTQZQEUZXOjobHeFV+ZFaJbiV8UrZMO2HZWnemXVk5Z7a-rnT7b0YxYWYTX1UhaLWHeLTRqGIQGAIgCQOQKALDXLSAAAMQ2Dr235zUAVgCoDNAAAq6BSgNAOAtoB2lgcAF9CQrthgAAtM4raMQHgBoDsCJkJtkHPVqM-AiZTZmkvfHWvRvZvTttvbvQfYREfSfUkGfRfXANKNfcgHfb6t4E-S-fwU+KYIQJ-XAydeDRHn-QzQAxvZViAxAPvYfcfaffVTA9g7ng-og8hrfCgzoCJp5u-Zg7yN-ZXdLPg+toQ+vcQ8neAKA+Q5AzudQ+zffkjvQ0eow8-cwx5ugx-cOJw-4dw7Lf-YA0AzziQ2Q+AxQ1A7Vu2OI-A9IwTMg3IyJvVmw1g1Y+HUGZVXhcVHwzYAIyRTvaQ2A+kBA5Q6zdQyrZI7fffWaEw5Y4o+w1KEdvpao1+DwwKc41o4bDo548YN4wY1JrhH4yY0E+Y6gwJpExg1g5E3Y9WbE6bvE645JUIx4yIz43k9Qy0U1aYytI-RY+k2E1gy0VE8VQ1KU045oxU49VU7o14-o1nuwNQ6nQEwg9k7I7k7Du0-EILl0xHQ43bVZOU8sUkzU2kwJuM5fR3VM00weC03M2jgs1KA7ss-Y707BBs1vYI+48Myk6M4BV0NQwc8SVIzMyc-IwLuc5RJc8UzxTc+s-05sw88I3o6I689QwlY098yE2Lv83EAlVcyU+owQ2C-c245CyM9Cwdp8LC1k0g7M78y7iLAU-EKi0C0iSC4aHc8AxC9U1C7U-btQ41fZUcw-YiwJpc5S1KGPmi8Cxi7w1i4yzi8y3i6y9nuy8Swwz8yJqi-y3XCo904vSK3E2K9o0y0848Kk1nhbNQ1-LQ18ySwq1Jkq0o5-JvRXdEz0xq2U1q4kzq8k3qy86Pkay9Ycwi60wJoK8qwwqqys3S8YAy9qxK7q6tO67Vu8Eayjd62azy9Psi2ITgz-XNiG48GG86xG661G-iygZwHG3KzI+a9gTa9Y2UKwzS7-Q6304AwM5nkM3m-q4BdYEaxI584E4m765MMazAAGzYUG9c3W7c06yyFsyyzs32+fZfUO7aVKVy8E724Jm-YO7Y5PbS6O6Cw2+C7m9swSbO7A7siW2Y6S6-Wu1a8-EU5u7W3HZi7u9i5U48y29G-wc4Ea-4129Mz26c6m-8IOze2bVu-e6K4++K8+7i88wW++0aw05yz63+6w4O50zWxm9u-S+Oy2Pu1OwSUY3O5M9+0uzk2S4JlY4O0s2h3gxh6G1h9hDh1K9O2R0ax83ad2-K0m2Rym4C7e+h6B5q+B+G5B5K9B9K7six6e805xyexS1ewkDx8B3e-XY64Jzm8J5G622fRk3O3Cwh7+6RzJwB3J4SWDem9R-xyp0Q3u+p6+zB9gXs8e7p2ncR+e-wZ04O9S7x+Z8p-W1Z0+4My+we22w53upJ8c9J+58Z4K1R2oxZ75-w9ZwF1B263Z32283Oxy854hwZ0s4O9F157Fz52O6pxOy60F2fel7A46YlT+xxyu7sbJ+E5RNV0KyB0Vzu35xB0lyJyl2J4S3O2F9y-V3y8Z8O+i3F8V510J91xp2+9gf17A4R2x7V6W9JyN01xtGN8KxNx1wl-5024F7h224a5fUt4u9l6-Zaxt5RwVzEzR1m3R7NAx6J0x7Wp64N8u3+1d1gzgWm1w3dzt5hyV9hzZ+VygbG3O160Rxd-wf68Z2-TFwD+10D1N2pzN7Z2JxD8e2d01i52W323Dxtw16Z-9-a4D7R8D-R6D0d3FUW5ffG9D-pywxWwG9W7d2T8jxT6j6V89710xwhu8x9yR8z8iwp2hSO+Tw95T099T4xzuUe3EKx+d0zx5pext2L1Wdt5z1L9zyD+j2D6r8Wwu7jzDwJsmSm2z4p3x9r6vY95O3L6RR+3Owz8t3j5x72Rb1t21-TWB7r1T-rzT-VU78e0rybyr2b8h8Zxr6ddbz7wJ37zLwHw73Ffh7A52676b0meR3Jxu1b953H5Z3t11wd8l-m9K7uUS8b3Q5nwFtnxt553n4VwX-Fy44lyXz12X-z9p7A05wm3V6c84Pk3Jw3+L+Nzb9mzz7Ly9zud3wkOn8r-36R4Pym7n6P1r835N0X9N+37N6lwFiF-Oya+x6tyu1RUZ0T6v5r9742Q+wn-b9P6RQf734z4vyw5F0TyP1f0pxv7t63-t9Wod2T71VKuVEIXq5zN65c5OQHNftf0-KF8-+xfAAaX007ADZWVfU1q-w8yQCNu+XRvkjx-4o8t+aPHfhj354Lc4gmXPvifwH7rcsGuAmAd-xv6+8iBk-JPg-zirkDDONXN3qf1oFlBoBX-WPkwPj4sC9eJAg3mbxO7Hsv2GfcPkmW+78CvejAuAS3wSasDxBgfDzFINC7oDj+Z7fHgFgUGfx6Bgg-PsIPgFqCxBSAjvigI8xY84g8HLLnIICyE8OmSgoQSoM34IDt+1g3fuX3sH9t4WzghqimwraI8OeBArnqIP94aCgBrNOnsextZBDMBrWFnsZzCHs91WkvW3tL3v588nqCQ3FLoJW76DOOa1c-j91Q6ZDVm01LwZYJiG+DSBT1BXh0WKE8DTmH1RrpUPcFmDPBv-eoYn1iHsDDGCvarskOoGkdOhFQ3kBkLwERDzBqgxto0IkFt1g+V9NoTXwxopsehTfBYXUKWESpABww1mmsND7V9nBWwrocTD+52ssh4-O3mV00GtZU+cQefmHxSFt06+NjHYfgL2H9CDhtiI4fkMAps00BR-EoVJxXZs1kWJgmPr0Kqr7C2+ywp4W3Vn5nCMBEwyxkP3V4-D5hfQwgd4OIHIi4hytDtmAIMHthsRP3S-nCN2H4iohhI9QcSOOGtYQulAl-piNZrv86BuIu4ZEJ17RDBhzI4Ec7QP6OCqBpQqEdyLKBVC5hfIv4QSIGF5DO+Kdd7hsIuHYCfuCPaoZmxyF39HhJItuiAKBLqiPhdWTUZ6l5E1C4aAoxkVYMOHIC5ubdTgW8POFmj26K-K0bqIn72jARjovfu3SNbsjZB7ovgcYJ+GhhiA6gGgIjngCiYlAEIcYJUGIBoAigfAOYDgAmADBmAVQAgOkC8y8B8ARADMVmMQDMBhM4UNMk0GErDIYy4ifBuMCCbVjVkHBSDA2PGCGYN4IAGenPRLHZimgFY6MGyS7FFjCAAABXZSTgYwDMF+gAHFUAmAKENIFTEQB0xjAUscwFHF71CALAKAAABkJQjQDWKOIADK8KdsIWLzEAB5SphAwADW243cQePIiNB4xEIQoMfTvGTwLx+bO8TeMGY6ANgGDE8eoFqCIAZwN9fXFcHCB3iUAT9HAGAA6QQAXgqBUaKhJcDoTLAfwFcGeMciuBdAEAGoKgAnHV0u8VtOADfUZwEI944wHQIRMhAQA96lbHNPvEonvlxgNQGAJAHXggAcA9E4wAADEms849ABgDmBVBUxO44KCQB0A5A0AKSEAAAEEcAtgHcWEAQkz1bAUpWwCgFEm2BWgHQWwFUAgA4A+Atge+sQFsAmSwAWkprJZOPpWSdJOQGyWmKfpQAAgIAcYLUHoApAZg4QPoMwDomAS-AXYvQFUCqB0AoAM9AAPpLiUxaYvsWWKaCjjEp5Y7sFOOHHTiexhAVKQOPSlDjx0XY3MUQGMBeYkxeAHQBoDHBQAMp4AQgKJg0BKAoAiktAGgFymgAxMNADIIQDkCEBmggkwwMwxEmYB2wsQXgJ1O6knjmGJ9YaZ0BABCSH8s08SZJLYC8BWgCEvAM0HCjmhNpAAUT1CRBJYfkm4HGIgAJjCArEOcQuIwCjSbxzUcKK5I0Cf0DxfANyZ5PGmI4uphAF6W9MeAAA5PMSRMBikBCghAOeghIACyeY0qcwg+n0BupAkmgE1MhDwAcAjUpQGtMMB3iUx4QHKeuP7GgAMAbQQgIpKUCSgNYO0-engH0AKBsgbOFQBMCgBniiAtMoqJmIJnWj+oxUrYPoCKBoAIQY0kABFJwDVAzpp086XDK+knjCAn0xgAAEk2waMsmbwHUklBvxNgcYDkE1DMzCArM9qZzLPjcz+IvM9AALKSDCzRZkoN8eSAmmEBpZssnAArNRnoyVZJktWZFEgLTjj6UU1AJ9IyCRABJRQD6KADCnGSEJY4s6Zgyiniz3xFIeiagAzHqB9Ar4s6bHNzHhgZgR9HQHeKhklTHgVQRqfQAhAqAHZnk6cUfSjG1BIQU48QEAA"
    width="100%"
    height="600px"
    style="border: 1px solid #ccc; display: block; background: #fff; width: ${width}px; height: ${height}px;"
    title="Unigraph Factor Graph Example"
    allowfullscreen>
</iframe>

##

## UnigraphIframe Component

component:

### Basic UnigraphIframe Usage

```tsx
import { UnigraphIframe } from "../components/common";

<UnigraphIframe
  src="/docs-structure.html"
  title="Documentation Structure"
  width="100%"
  height={500}
/>;
```

### Interactive Documentation Structure

Embed an interactive diagram of Unigraph's documentation structure:

```tsx
<UnigraphIframe
  src="/docs-structure.html"
  title="Unigraph Documentation Structure"
  width="100%"
  height={500}
  showControls={true}
  resizable={true}
  onLoad={() => console.log("Documentation loaded")}
  onError={(error) => console.error("Failed to load:", error)}
  loadingMessage="Loading documentation structure..."
  allowFullscreen={true}
/>
```

## Interactive Diagram with Custom Styling

Create a custom-styled interactive diagram:

```tsx
<UnigraphIframe
  src="/interactive-diagram.html"
  title="Interactive Diagram"
  width={800}
  height={400}
  showControls={true}
  resizable={false}
  style={{
    border: "2px solid #1976d2",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(25, 118, 210, 0.2)",
  }}
  iframeProps={{
    sandbox: "allow-scripts allow-same-origin",
    referrerPolicy: "no-referrer",
  }}
/>
```

## Minimal Configuration

For simple content embedding with minimal controls:

```tsx
<UnigraphIframe
  src="/simple-content.html"
  title="Simple Content"
  width="100%"
  height={300}
  showControls={false}
  showLoading={false}
/>
```

## Custom Styled Example

Advanced styling with custom colors and effects:

```tsx
<UnigraphIframe
  src="/custom-styled-content.html"
  title="Custom Styled Content"
  width="100%"
  height={400}
  showControls={true}
  className="custom-iframe"
  style={{
    border: "3px solid #ff6b6b",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(255, 107, 107, 0.3)",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  }}
  loadingMessage="Loading custom styled content..."
/>
```

## Security-Focused Configuration

For embedding external content with security considerations:

```tsx
<UnigraphIframe
  src="https://external-content.com"
  title="External Content"
  width="100%"
  height={400}
  showControls={true}
  iframeProps={{
    sandbox: "allow-scripts allow-same-origin allow-forms",
    referrerPolicy: "no-referrer",
    loading: "lazy",
  }}
  onLoad={() => console.log("External content loaded safely")}
  onError={(error) => console.error("External content failed to load:", error)}
/>
```

## Event Handling Examples

Handle various iframe events:

```tsx
const handleIframeLoad = () => {
  console.log("Iframe content loaded successfully");
  // You can perform additional actions here
  // such as analytics tracking, content validation, etc.
};

const handleIframeError = (error: Event) => {
  console.error("Iframe failed to load:", error);
  // Handle error gracefully
  // Maybe show a fallback or retry mechanism
};

<UnigraphIframe
  src="/example-content.html"
  title="Event Handling Example"
  width="100%"
  height={400}
  onLoad={handleIframeLoad}
  onError={handleIframeError}
  showControls={true}
/>;
```

## Responsive Design Example

Create a responsive iframe that adapts to different screen sizes:

```tsx
<UnigraphIframe
  src="/responsive-content.html"
  title="Responsive Content"
  width="100%"
  height={window.innerWidth < 768 ? 300 : 500}
  showControls={true}
  resizable={true}
  style={{
    minHeight: "300px",
    maxHeight: "600px",
  }}
/>
```

## Dark Mode Compatible Example

Ensure your iframe works well in both light and dark modes:

```tsx
<UnigraphIframe
  src="/dark-mode-compatible.html"
  title="Dark Mode Compatible Content"
  width="100%"
  height={400}
  showControls={true}
  style={{
    border: "1px solid var(--border-color, #e0e0e0)",
    backgroundColor: "var(--bg-color, #fafafa)",
  }}
  className="dark-mode-compatible"
/>
```

## Fullscreen Interactive Experience

Create an immersive fullscreen experience:

```tsx
<UnigraphIframe
  src="/immersive-experience.html"
  title="Immersive Interactive Experience"
  width="100%"
  height={600}
  showControls={true}
  allowFullscreen={true}
  resizable={true}
  style={{
    border: "none",
    borderRadius: "0",
    boxShadow: "0 0 0 rgba(0, 0, 0, 0)",
  }}
  loadingMessage="Preparing immersive experience..."
/>
```

## Configuration Options

### UnigraphIframe Props

The `UnigraphIframe` component accepts the following configuration options:

| Prop              | Type                                            | Default                            | Description                            |
| ----------------- | ----------------------------------------------- | ---------------------------------- | -------------------------------------- |
| `src`             | `string`                                        | -                                  | The URL to embed in the iframe         |
| `title`           | `string`                                        | -                                  | Title for accessibility and display    |
| `width`           | `string \| number`                              | `"100%"`                           | Width of the iframe                    |
| `height`          | `string \| number`                              | `"400px"`                          | Height of the iframe                   |
| `resizable`       | `boolean`                                       | `false`                            | Whether the iframe should be resizable |
| `showControls`    | `boolean`                                       | `true`                             | Whether to show control buttons        |
| `className`       | `string`                                        | `""`                               | Custom CSS class name                  |
| `style`           | `React.CSSProperties`                           | `{}`                               | Custom styles                          |
| `onLoad`          | `() => void`                                    | -                                  | Callback when iframe loads             |
| `onError`         | `(error: Event) => void`                        | -                                  | Callback when iframe fails to load     |
| `showLoading`     | `boolean`                                       | `true`                             | Whether to show loading state          |
| `loadingMessage`  | `string`                                        | `"Loading interactive content..."` | Custom loading message                 |
| `allowFullscreen` | `boolean`                                       | `true`                             | Whether to allow fullscreen mode       |
| `iframeProps`     | `React.IframeHTMLAttributes<HTMLIFrameElement>` | `{}`                               | Additional iframe attributes           |

### Component Props Reference

| Prop              | Type                                            | Default                            | Description                            |
| ----------------- | ----------------------------------------------- | ---------------------------------- | -------------------------------------- |
| `src`             | `string`                                        | -                                  | The URL to embed in the iframe         |
| `title`           | `string`                                        | -                                  | Title for accessibility and display    |
| `width`           | `string \| number`                              | `"100%"`                           | Width of the iframe                    |
| `height`          | `string \| number`                              | `"400px"`                          | Height of the iframe                   |
| `resizable`       | `boolean`                                       | `false`                            | Whether the iframe should be resizable |
| `showControls`    | `boolean`                                       | `true`                             | Whether to show control buttons        |
| `className`       | `string`                                        | `""`                               | Custom CSS class name                  |
| `style`           | `React.CSSProperties`                           | `{}`                               | Custom styles                          |
| `onLoad`          | `() => void`                                    | -                                  | Callback when iframe loads             |
| `onError`         | `(error: Event) => void`                        | -                                  | Callback when iframe fails to load     |
| `showLoading`     | `boolean`                                       | `true`                             | Whether to show loading state          |
| `loadingMessage`  | `string`                                        | `"Loading interactive content..."` | Custom loading message                 |
| `allowFullscreen` | `boolean`                                       | `true`                             | Whether to allow fullscreen mode       |
| `iframeProps`     | `React.IframeHTMLAttributes<HTMLIFrameElement>` | `{}`                               | Additional iframe attributes           |

## Best Practices

### 1. Always Provide a Title

```tsx
// Good
<UnigraphIframe src="/content.html" title="Descriptive Title" />

// Avoid
<UnigraphIframe src="/content.html" />
```

### 2. Handle Loading States

```tsx
<UnigraphIframe
  src="/content.html"
  title="Content"
  showLoading={true}
  loadingMessage="Loading your interactive content..."
  onLoad={() => console.log("Content ready")}
  onError={(error) => console.error("Failed to load:", error)}
/>
```

### 3. Use Appropriate Security Settings

```tsx
<UnigraphIframe
  src="https://external-site.com"
  title="External Content"
  iframeProps={{
    sandbox: "allow-scripts allow-same-origin",
    referrerPolicy: "no-referrer",
  }}
/>
```

### 4. Make Content Responsive

```tsx
<UnigraphIframe
  src="/content.html"
  title="Responsive Content"
  width="100%"
  height={window.innerWidth < 768 ? 300 : 500}
  style={{ minHeight: "300px" }}
/>
```

## Common Use Cases

### Live Unigraph App Embedding

Here's an example of embedding the actual Unigraph application:

```tsx
<UnigraphIframe
  src="http://localhost:3001"
  title="Live Unigraph Application"
  width="100%"
  height={700}
  showControls={true}
  resizable={true}
  allowFullscreen={true}
  loadingMessage="Loading Unigraph application..."
  style={{
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  }}
  iframeProps={{
    sandbox: "allow-scripts allow-same-origin allow-forms allow-popups",
    referrerPolicy: "no-referrer",
  }}
/>
```

**Live Demo:**

<UnigraphIframe
src="http://localhost:3001"
title="Live Unigraph Application"
width="100%"
height={700}
showControls={true}
resizable={true}
allowFullscreen={true}
loadingMessage="Loading Unigraph application..."
style={{
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  }}
iframeProps={{
    sandbox: "allow-scripts allow-same-origin allow-forms allow-popups",
    referrerPolicy: "no-referrer",
  }}
/>

### Documentation Structure Visualization

```tsx
<UnigraphIframe
  src="/docs-structure.html"
  title="Unigraph Documentation Structure"
  width="100%"
  height={600}
  showControls={true}
  resizable={true}
  allowFullscreen={true}
  loadingMessage="Loading documentation structure..."
/>
```

### Interactive Diagrams

```tsx
<UnigraphIframe
  src="/interactive-diagram.html"
  title="Interactive System Diagram"
  width="100%"
  height={500}
  showControls={true}
  resizable={true}
  style={{
    border: "2px solid #1976d2",
    borderRadius: "8px",
  }}
/>
```

### Embedded Applications

```tsx
<UnigraphIframe
  src="/embedded-app.html"
  title="Embedded Application"
  width="100%"
  height={700}
  showControls={true}
  allowFullscreen={true}
  iframeProps={{
    sandbox: "allow-scripts allow-same-origin allow-forms",
  }}
/>
```

## Troubleshooting

### Content Not Loading

- Check the `src` URL is correct and accessible
- Verify CORS settings if loading external content
- Check browser console for error messages

### Controls Not Appearing

- Ensure `showControls={true}` is set
- Check if the component is properly imported
- Verify CSS is loaded correctly

### Fullscreen Not Working

- Ensure `allowFullscreen={true}` is set
- Check browser support for Fullscreen API
- Verify the iframe content allows fullscreen

### Styling Issues

- Use the `style` prop for custom styling
- Check CSS specificity if styles aren't applying
- Ensure responsive design considerations

## Integration with Markdown

When using this component in markdown files, you can import and use it like any other React component:

```tsx
import { UnigraphIframe } from "../components/common";

// Your markdown content here...

<UnigraphIframe
  src="/your-content.html"
  title="Your Content"
  width="100%"
  height={400}
/>;

// More markdown content...
```

This component provides a powerful and flexible way to embed interactive content into your documentation while maintaining a professional appearance and excellent user experience.
