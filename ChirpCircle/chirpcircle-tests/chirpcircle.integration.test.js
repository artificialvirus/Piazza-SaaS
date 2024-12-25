const request = require('supertest');
const baseURL = 'http://35-193-193-53.nip.io' || 'http://34-136-86-55.nip.io';

jest.setTimeout(300000); // 5 minutes timeout for all tests

let olgaAccessToken, nickAccessToken, maryAccessToken, nestorAccessToken;
let olgaPostId, nickPostId, maryPostId, nestorHealthPostId;

describe('ChirpCircle End-to-End Tests (TC 1–20)', () => {
  beforeAll(async () => {
    // Obtain tokens via local-test-login
    const olgaRes = await request(baseURL)
      .post('/api/v1/auth/local-test-login')
      .send({ username: 'Olga' })
      .expect(200);
    olgaAccessToken = olgaRes.body.data.accessToken;

    const nickRes = await request(baseURL)
      .post('/api/v1/auth/local-test-login')
      .send({ username: 'Nick' })
      .expect(200);
    nickAccessToken = nickRes.body.data.accessToken;

    const maryRes = await request(baseURL)
      .post('/api/v1/auth/local-test-login')
      .send({ username: 'Mary' })
      .expect(200);
    maryAccessToken = maryRes.body.data.accessToken;

    const nestorRes = await request(baseURL)
      .post('/api/v1/auth/local-test-login')
      .send({ username: 'Nestor' })
      .expect(200);
    nestorAccessToken = nestorRes.body.data.accessToken;
  });

  // Helper function to check if a post exists
  const postExists = async (accessToken, content) => {
    const res = await request(baseURL)
      .get('/api/v1/posts')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    const posts = res.body.data;
    return posts.some(post => post.content === content);
  };

  // TC 3: Olga makes a call without token
  test('TC 3: Olga makes a call without token', async () => {
    const res = await request(baseURL)
      .get('/api/v1/users/me') // no Authorization header
      .expect(401);
    expect(res.body.message).toBe('Unauthorized');
  });

  // TC 4: Olga posts a Tech message (5 min expiration)
  test('TC 4: Olga posts a Tech message', async () => {
    const content = 'Olga’s Tech Post';
    const exists = await postExists(olgaAccessToken, content);
    if (exists) {
      console.log('Olga’s Tech Post already exists, skipping creation.');
      return;
    }

    const expirationTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const res = await request(baseURL)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${olgaAccessToken}`)
      .send({
        content,
        topic: 'Tech',
        expiration_time: expirationTime,
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.topic).toBe('tech');
    olgaPostId = res.body.data._id;
  });

  // TC 5: Nick posts a Tech message
  test('TC 5: Nick posts a Tech message', async () => {
    const content = 'Nick’s Tech Post';
    const exists = await postExists(nickAccessToken, content);
    if (exists) {
      console.log('Nick’s Tech Post already exists, skipping creation.');
      return;
    }

    const expirationTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const res = await request(baseURL)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${nickAccessToken}`)
      .send({
        content,
        topic: 'Tech',
        expiration_time: expirationTime,
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    nickPostId = res.body.data._id;
  });

  // TC 6: Mary posts a Tech message
  test('TC 6: Mary posts a Tech message', async () => {
    const content = 'Mary’s Tech Post';
    const exists = await postExists(maryAccessToken, content);
    if (exists) {
      console.log('Mary’s Tech Post already exists, skipping creation.');
      return;
    }

    const expirationTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const res = await request(baseURL)
      .post('/api/v1/posts')
      .set('Authorization', `Bearer ${maryAccessToken}`)
      .send({
        content,
        topic: 'Tech',
        expiration_time: expirationTime,
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    maryPostId = res.body.data._id;
  });

  // TC 7: Verify zero interactions
  test('TC 7: Browse Tech posts; all zero likes/dislikes/comments', async () => {
    const res = await request(baseURL)
      .get('/api/v1/posts?topic=tech')
      .set('Authorization', `Bearer ${nickAccessToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    const posts = res.body.data;
    expect(posts.length).toBeGreaterThanOrEqual(3);

    const olgaPost = posts.find(p => p._id === olgaPostId);
    const nickPost = posts.find(p => p._id === nickPostId);
    const maryPost = posts.find(p => p._id === maryPostId);

    [olgaPost, nickPost, maryPost].forEach(post => {
      expect(post.likes.length).toBe(0);
      expect(post.dislikes.length).toBe(0);
    });
  });

  // TC 8: Nick and Olga like Mary’s post
  test('TC 8: Nick and Olga like Mary’s post', async () => {
    await request(baseURL)
      .post(`/api/v1/posts/${maryPostId}/like`)
      .set('Authorization', `Bearer ${nickAccessToken}`)
      .expect(200);

    await request(baseURL)
      .post(`/api/v1/posts/${maryPostId}/like`)
      .set('Authorization', `Bearer ${olgaAccessToken}`)
      .expect(200);
  });

  // TC 9: Nestor likes Nick’s and dislikes Mary’s
  test('TC 9: Nestor likes Nick’s and dislikes Mary’s post', async () => {
    await request(baseURL)
      .post(`/api/v1/posts/${nickPostId}/like`)
      .set('Authorization', `Bearer ${nestorAccessToken}`)
      .expect(200);

    await request(baseURL)
      .post(`/api/v1/posts/${maryPostId}/dislike`)
      .set('Authorization', `Bearer ${nestorAccessToken}`)
      .expect(200);
  });

  // TC 10: Verify likes/dislikes on Tech posts
  test('TC 10: Verify likes/dislikes on Tech posts', async () => {
    const res = await request(baseURL)
      .get('/api/v1/posts?topic=tech')
      .set('Authorization', `Bearer ${nickAccessToken}`)
      .expect(200);

    const posts = res.body.data;
    const maryPost = posts.find(p => p._id === maryPostId);
    const nickPost = posts.find(p => p._id === nickPostId);

    expect(maryPost.likes.length).toBe(2); // Nick, Olga
    expect(maryPost.dislikes.length).toBe(1); // Nestor
    expect(nickPost.likes.length).toBe(1); // Nestor
    expect(nickPost.dislikes.length).toBe(0);
  });

  // TC 11: Mary tries to like her own post
  test('TC 11: Mary likes her own post - fail', async () => {
    const res = await request(baseURL)
      .post(`/api/v1/posts/${maryPostId}/like`)
      .set('Authorization', `Bearer ${maryAccessToken}`)
      .expect(400);
    expect(res.body.message).toBe('You cannot like your own post.');
  });

  // TC 12: Nick and Olga comment on Mary’s Tech post
  test('TC 12: Nick and Olga add comments to Mary’s post', async () => {
    await request(baseURL)
      .post(`/api/v1/posts/${maryPostId}/comments`)
      .set('Authorization', `Bearer ${nickAccessToken}`)
      .send({ text: 'Great post, Mary!' })
      .expect(201);

    await request(baseURL)
      .post(`/api/v1/posts/${maryPostId}/comments`)
      .set('Authorization', `Bearer ${olgaAccessToken}`)
      .send({ text: 'Agreed, nice post!' })
      .expect(201);

    await request(baseURL)
      .post(`/api/v1/posts/${maryPostId}/comments`)
      .set('Authorization', `Bearer ${nickAccessToken}`)
      .send({ text: 'Another comment from Nick!' })
      .expect(201);

    await request(baseURL)
      .post(`/api/v1/posts/${maryPostId}/comments`)
      .set('Authorization', `Bearer ${olgaAccessToken}`)
      .send({ text: 'Olga commenting again!' })
      .expect(201);
  });

  // TC 13: Verify comments on Mary’s Tech post
  test('TC 13: Verify comments on Mary’s post', async () => {
    const commentsRes = await request(baseURL)
      .get(`/api/v1/posts/${maryPostId}/comments`)
      .set('Authorization', `Bearer ${nickAccessToken}`)
      .expect(200);

    const comments = commentsRes.body.data;
    expect(comments.length).toBeGreaterThanOrEqual(4);
  });

  // Expiration Tests (TC 14–20)
  describe('ChirpCircle Expiration Tests (TC 14–20)', () => {
    beforeAll(() => {
      // Ensure TEST_MODE=EXPIRATION is set
      if (process.env.TEST_MODE !== 'EXPIRATION') {
        console.warn('TEST_MODE is not EXPIRATION. Expiration tests may fail.');
      }
    });

    // TC 14: Nestor posts in Health topic (10s expiration)
    test('TC 14: Nestor posts in Health topic with short expiration', async () => {
      const expirationTime = new Date(Date.now() + 10 * 1000).toISOString();
      const res = await request(baseURL)
        .post('/api/v1/posts')
        .set('Authorization', `Bearer ${nestorAccessToken}`)
        .send({
          content: 'Nestor’s Health Post',
          topic: 'Health',
          expiration_time: expirationTime,
        })
        .expect(201);

      expect(res.body.success).toBe(true);
      nestorHealthPostId = res.body.data._id;
    });

    // TC 15: Mary sees only Nestor’s Health post
    test('TC 15: Mary sees only Nestor’s Health post', async () => {
      const res = await request(baseURL)
        .get('/api/v1/posts?topic=health')
        .set('Authorization', `Bearer ${maryAccessToken}`)
        .expect(200);

      const posts = res.body.data;
      expect(posts.length).toBe(1);
      expect(posts[0]._id).toBe(nestorHealthPostId);
    });

    // TC 16: Mary comments on Nestor’s Health post
    test('TC 16: Mary comments on Nestor’s Health post', async () => {
      await request(baseURL)
        .post(`/api/v1/posts/${nestorHealthPostId}/comments`)
        .set('Authorization', `Bearer ${maryAccessToken}`)
        .send({ text: 'Interesting Health Post!' })
        .expect(201);
    });

    // Wait for post expiration
    test('Wait for post expiration', async () => {
      console.log('Waiting for 30 seconds to allow post expiration...');
      await new Promise(r => setTimeout(r, 30000));
    });

    // TC 17: Disliking expired post fails
    test('TC 17: Disliking expired post fails', async () => {
      const res = await request(baseURL)
        .post(`/api/v1/posts/${nestorHealthPostId}/dislike`)
        .set('Authorization', `Bearer ${maryAccessToken}`)
        .expect(400);

      expect(res.body.message.toLowerCase()).toContain('cannot');
    });

    // TC 18: Nestor checks expired Health posts
    test('TC 18: Nestor checks expired Health posts', async () => {
      const postsRes = await request(baseURL)
        .get('/api/v1/posts?topic=health&status=Expired')
        .set('Authorization', `Bearer ${nestorAccessToken}`)
        .expect(200);

      const posts = postsRes.body.data;
      expect(posts.length).toBe(1);
      expect(posts[0]._id).toBe(nestorHealthPostId);

      const commentsRes = await request(baseURL)
        .get(`/api/v1/posts/${nestorHealthPostId}/comments`)
        .set('Authorization', `Bearer ${nestorAccessToken}`)
        .expect(200);

      const comments = commentsRes.body.data;
      expect(comments.some(c => c.text.includes('Interesting Health Post!'))).toBe(true);
    });

    // TC 19: Nick browses expired Sports posts; should be empty
    test('TC 19: Expired Sports posts empty', async () => {
      const res = await request(baseURL)
        .get('/api/v1/posts?topic=sports&status=Expired')
        .set('Authorization', `Bearer ${nickAccessToken}`)
        .expect(200);

      const posts = res.body.data;
      expect(posts.length).toBe(0);
    });

    // TC 20: Most active post in Tech is Mary’s
    test('TC 20: Most active post in Tech is Mary’s', async () => {
      const res = await request(baseURL)
        .get('/api/v1/posts/most-active?topic=tech')
        .set('Authorization', `Bearer ${nestorAccessToken}`)
        .expect(200);

      const posts = res.body.data;
      console.log('Most active Tech posts:', posts);

      expect(posts.length).toBeGreaterThan(0);
      expect(posts[0]._id).toBe(maryPostId);
    });
  });
});

