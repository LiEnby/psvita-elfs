  �'      ResB            �        �  �         SpelloutRules OrdinalRules DurationRules ���q  % w i t h - w o r d s : 
 0   s e c o n d s ;   1   s e c o n d ;   = 0 =   s e c o n d s ; 
 6 0 / 6 0 :   < % % m i n < [ ,   > > ] ; 
 3 6 0 0 / 6 0 :   < % % h r < [ ,   > > > ] ; 
 % % m i n : 
 0   m i n u t e s ;   1   m i n u t e ;   = 0 =   m i n u t e s ; 
 % % h r : 
 0   h o u r s ;   1   h o u r ;   = 0 =   h o u r s ; 
 % i n - n u m e r a l s : 
 = 0 =   s e c . ; 
 6 0 :   = % % m i n - s e c = ; 
 3 6 0 0 :   = % % h r - m i n - s e c = ; 
 % % m i n - s e c : 
 0 :   : = 0 0 = ; 
 6 0 / 6 0 :   < 0 < > > ; 
 % % h r - m i n - s e c : 
 0 :   : = 0 0 = ; 
 6 0 / 6 0 :   < 0 0 < > > ; 
 3 6 0 0 / 6 0 :   < # , # # 0 < : > > > ; 
 % % l e n i e n t - p a r s e : 
 &   ' : '   =   ' . '   =   '   '   =   ' - ' ; 
   I   % m a i n : 
 = # , # # 0 = = % % a b b r e v = ; 
 % % a b b r e v : 
 t h ;   s t ;   n d ;   r d ;   t h ; 
 2 0 :   > > ; 
 1 0 0 :   > > ; 
   �  % s i m p l i f i e d : 
 - x :   m i n u s   > > ; 
 x . x :   < <   p o i n t   > > ; 
 z e r o ;   o n e ;   t w o ;   t h r e e ;   f o u r ;   f i v e ;   s i x ;   s e v e n ;   e i g h t ;   n i n e ; 
 t e n ;   e l e v e n ;   t w e l v e ;   t h i r t e e n ;   f o u r t e e n ;   f i f t e e n ;   s i x t e e n ; 
 s e v e n t e e n ;   e i g h t e e n ;   n i n e t e e n ; 
 2 0 :   t w e n t y [ - > > ] ; 
 3 0 :   t h i r t y [ - > > ] ; 
 4 0 :   f o r t y [ - > > ] ; 
 5 0 :   f i f t y [ - > > ] ; 
 6 0 :   s i x t y [ - > > ] ; 
 7 0 :   s e v e n t y [ - > > ] ; 
 8 0 :   e i g h t y [ - > > ] ; 
 9 0 :   n i n e t y [ - > > ] ; 
 1 0 0 :   < <   h u n d r e d [   > > ] ; 
 1 0 0 0 :   < <   t h o u s a n d [   > > ] ; 
 1 , 0 0 0 , 0 0 0 :   < <   m i l l i o n [   > > ] ; 
 1 , 0 0 0 , 0 0 0 , 0 0 0 :   < <   b i l l i o n [   > > ] ; 
 1 , 0 0 0 , 0 0 0 , 0 0 0 , 0 0 0 :   < <   t r i l l i o n [   > > ] ; 
 1 , 0 0 0 , 0 0 0 , 0 0 0 , 0 0 0 , 0 0 0 :   = # , # # 0 = ; 
 % d e f a u l t : 
 - x :   m i n u s   > > ; 
 x . x :   < <   p o i n t   > > ; 
 = % s i m p l i f i e d = ; 
 1 0 0 :   < <   h u n d r e d [   > % % a n d > ] ; 
 1 0 0 0 :   < <   t h o u s a n d [   > % % a n d > ] ; 
 1 0 0 , 0 0 0 > > :   < <   t h o u s a n d [ > % % c o m m a s > ] ; 
 1 , 0 0 0 , 0 0 0 :   < <   m i l l i o n [ > % % c o m m a s > ] ; 
 1 , 0 0 0 , 0 0 0 , 0 0 0 :   < <   b i l l i o n [ > % % c o m m a s > ] ; 
 1 , 0 0 0 , 0 0 0 , 0 0 0 , 0 0 0 :   < <   t r i l l i o n [ > % % c o m m a s > ] ; 
 1 , 0 0 0 , 0 0 0 , 0 0 0 , 0 0 0 , 0 0 0 :   = # , # # 0 = ; 
 % % a n d : 
 a n d   = % d e f a u l t = ; 
 1 0 0 :   = % d e f a u l t = ; 
 % % c o m m a s : 
 '   a n d   = % d e f a u l t = ; 
 1 0 0 :   ,   = % d e f a u l t = ; 
 1 0 0 0 :   ,   < % d e f a u l t <   t h o u s a n d ,   > % d e f a u l t > ; 
 1 , 0 0 0 , 0 0 0 :   ,   = % d e f a u l t = ; % % l e n i e n t - p a r s e : 
       &     < <   '   '   < <   ' , '   < <   ' - ' ;   
    7 *     �   �   ������������